/**
 * Web Worker for Pyodide Judge & Execution Tracer
 */

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";

let pyodide = null;
let isReady = false;

// Python harness code for tracing and testcase evaluation
const PYTHON_HARNESS = `
import sys
import json
import time
import copy
import traceback

def safe_serialize(obj, depth=0):
    if depth > 3:
        return "<depth-limit>"
    if obj is None or isinstance(obj, (int, float, str, bool)):
        return obj
    elif isinstance(obj, (list, tuple)):
        if len(obj) > 100:
            return [safe_serialize(x, depth + 1) for x in obj[:100]] + [f"... +{len(obj)-100} more"]
        return [safe_serialize(x, depth + 1) for x in obj]
    elif isinstance(obj, dict):
        if len(obj) > 100:
            sliced = {str(k): safe_serialize(v, depth + 1) for i, (k, v) in enumerate(obj.items()) if i < 100}
            sliced["..."] = f"+{len(obj)-100} more"
            return sliced
        return {str(k): safe_serialize(v, depth + 1) for k, v in obj.items()}
    elif isinstance(obj, set):
        return [safe_serialize(x, depth + 1) for x in list(obj)[:100]]
    else:
        return str(obj)

def run_judge_and_trace(user_code, entry_point_name, test_cases_json, record_trace=True, max_steps=300):
    test_cases = json.loads(test_cases_json)
    
    # Global namespace for user code
    user_globals = {}
    
    try:
        compiled_code = compile(user_code, "<user_code>", "exec")
        exec(compiled_code, user_globals)
    except Exception as e:
        return json.dumps({
            "success": False,
            "error_type": "CompileError",
            "error": traceback.format_exc(),
            "results": []
        })

    if entry_point_name not in user_globals or not callable(user_globals[entry_point_name]):
        return json.dumps({
            "success": False,
            "error_type": "EntryPointNotFound",
            "error": f"함수 '{entry_point_name}'를 찾을 수 없습니다.",
            "results": []
        })

    fn = user_globals[entry_point_name]
    
    # 1. First test case with tracing if requested
    trace_frames = []
    
    def trace_callback(frame, event, arg):
        if len(trace_frames) >= max_steps:
            return None
        
        # Only trace user code execution
        if frame.f_code.co_filename != "<user_code>":
            return trace_callback
        
        if event in ("line", "return"):
            local_vars = {}
            for k, v in frame.f_locals.items():
                if not k.startswith("__") and not callable(v):
                    local_vars[k] = safe_serialize(v)
            
            trace_frames.append({
                "step": len(trace_frames) + 1,
                "line": frame.f_lineno,
                "event": event,
                "locals": local_vars,
                "returnValue": safe_serialize(arg) if event == "return" else None
            })
        return trace_callback

    results = []
    all_passed = True

    for idx, tc in enumerate(test_cases):
        inputs = tc.get("input", [])
        expected = tc.get("expected")
        
        # Fast clone inputs
        try:
            if isinstance(inputs, list) and len(inputs) > 500:
                cloned_inputs = [x[:] if isinstance(x, list) else x for x in inputs]
            else:
                cloned_inputs = copy.deepcopy(inputs)
        except Exception:
            cloned_inputs = inputs
        
        start_time = time.perf_counter()
        actual = None
        passed = False
        error_msg = None
        
        # Record trace only for the 1st test case
        should_trace = (idx == 0 and record_trace)
        if should_trace:
            sys.settrace(trace_callback)
            
        try:
            actual = fn(*cloned_inputs)
        except Exception as e:
            error_msg = traceback.format_exc()
        finally:
            if should_trace:
                sys.settrace(None)
                
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        if error_msg:
            passed = False
            all_passed = False
            results.append({
                "index": idx + 1,
                "passed": False,
                "error": error_msg,
                "actual": None,
                "expected": expected,
                "elapsed_ms": elapsed_ms
            })
        else:
            passed = (actual == expected)
            if not passed:
                all_passed = False
            results.append({
                "index": idx + 1,
                "passed": passed,
                "error": None,
                "actual": safe_serialize(actual),
                "expected": safe_serialize(expected),
                "elapsed_ms": elapsed_ms
            })

    return json.dumps({
        "success": True,
        "all_passed": all_passed,
        "results": results,
        "trace": trace_frames
    })
`;

async function initPyodide() {
  try {
    importScripts(PYODIDE_CDN);
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"
    });
    // Pre-load harness
    await pyodide.runPythonAsync(PYTHON_HARNESS);
    isReady = true;
    postMessage({ type: "INIT_SUCCESS" });
  } catch (err) {
    postMessage({ type: "INIT_ERROR", error: err.message || String(err) });
  }
}

self.onmessage = async function (e) {
  const { id, type, userCode, entryPoint, testCases, recordTrace } = e.data;

  if (type === "INIT") {
    if (!isReady) {
      await initPyodide();
    } else {
      postMessage({ type: "INIT_SUCCESS" });
    }
    return;
  }

  if (type === "EXECUTE") {
    if (!isReady) {
      postMessage({ id, type: "EXECUTE_ERROR", error: "Pyodide가 아직 준비되지 않았습니다." });
      return;
    }

    try {
      pyodide.globals.set("__user_code__", userCode);
      pyodide.globals.set("__entry_point__", entryPoint || "solution");
      pyodide.globals.set("__test_cases_json__", JSON.stringify(testCases || []));
      pyodide.globals.set("__record_trace__", recordTrace ? true : false);

      const runnerCode = `run_judge_and_trace(__user_code__, __entry_point__, __test_cases_json__, __record_trace__)`;
      const rawResult = await pyodide.runPythonAsync(runnerCode);
      const parsedResult = JSON.parse(rawResult);

      postMessage({
        id,
        type: "EXECUTE_SUCCESS",
        payload: parsedResult
      });
    } catch (err) {
      postMessage({
        id,
        type: "EXECUTE_ERROR",
        error: err.message || String(err)
      });
    }
  }
};

// Start init on worker load
initPyodide();
