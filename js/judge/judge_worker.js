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

// Python harness code for Data Science Judge (pandas, numpy, scipy, sklearn)
const DS_PYTHON_HARNESS = `
import json
import traceback
import numpy as np
import pandas as pd

def serialize_df_for_web(df, max_rows=15):
    if df is None:
        return None
    if isinstance(df, pd.Series):
        df = df.to_frame()
    if not isinstance(df, pd.DataFrame):
        if isinstance(df, np.ndarray):
            cols = [f"col_{i}" for i in range(df.shape[1])] if df.ndim > 1 else ["value"]
            df = pd.DataFrame(df, columns=cols)
        else:
            return str(df)
            
    head_df = df.head(max_rows)
    return {
        "columns": [str(c) for c in df.columns],
        "index": [str(i) for i in head_df.index],
        "data": [[None if pd.isna(v) else (round(float(v), 4) if isinstance(v, (float, np.floating)) else str(v)) for v in row] for row in head_df.values],
        "shape": list(df.shape),
        "null_counts": {str(k): int(v) for k, v in df.isnull().sum().items()},
        "dtypes": {str(k): str(v) for k, v in df.dtypes.items()}
    }

def ds_json_default(obj):
    if isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    if isinstance(obj, (np.integer, int)):
        return int(obj)
    if isinstance(obj, (np.floating, float)):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (pd.Timestamp, pd.Timedelta)):
        return str(obj)
    if hasattr(obj, "item"):
        try:
            return obj.item()
        except Exception:
            pass
    return str(obj)

def run_ds_judge(user_code, problem_id, validation_code):
    user_globals = {
        "pd": pd,
        "np": np,
        "pandas": pd,
        "numpy": np
    }
    
    try:
        compiled = compile(user_code, "<user_code>", "exec")
        exec(compiled, user_globals)
    except Exception as e:
        return json.dumps({
            "success": False,
            "error_type": "CompileError",
            "error": traceback.format_exc()
        }, default=ds_json_default)
        
    if "solution" not in user_globals or not callable(user_globals["solution"]):
        return json.dumps({
            "success": False,
            "error_type": "EntryPointNotFound",
            "error": "함수 'solution(df)'를 찾을 수 없습니다."
        }, default=ds_json_default)
        
    fn = user_globals["solution"]
    
    eval_globals = dict(user_globals)
    eval_globals["user_solution"] = fn
    eval_globals["serialize_df_for_web"] = serialize_df_for_web
    
    try:
        eval_globals["__validation_output__"] = None
        lines = validation_code.strip().splitlines()
        indented_lines = [("    " + line) for line in lines]
        exec_code = "def __validate__():" + chr(10) + chr(10).join(indented_lines) + chr(10) + "__validation_output__ = __validate__()"
        exec(exec_code, eval_globals)
        validation_output = eval_globals.get("__validation_output__", {})
        if not isinstance(validation_output, dict):
            validation_output = {"all_passed": True, "message": str(validation_output)}
            
        return json.dumps({
            "success": True,
            **validation_output
        }, default=ds_json_default)
    except Exception as e:
        return json.dumps({
            "success": False,
            "error_type": "AssertionError",
            "error": traceback.format_exc()
        }, default=ds_json_default)
`;

let isDSReady = false;

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
  const { id, type, userCode, entryPoint, testCases, recordTrace, problemId, validationCode } = e.data;

  if (type === "INIT") {
    if (!isReady) {
      await initPyodide();
    } else {
      postMessage({ type: "INIT_SUCCESS" });
    }
    return;
  }

  if (type === "LOAD_DS_PACKAGES") {
    if (!isReady) {
      postMessage({ id, type: "LOAD_DS_PACKAGES_ERROR", error: "Pyodide 기본 엔진이 아직 준비되지 않았습니다." });
      return;
    }
    try {
      if (!isDSReady) {
        await pyodide.loadPackage(["numpy", "pandas", "scipy", "scikit-learn"]);
        await pyodide.runPythonAsync(DS_PYTHON_HARNESS);
        isDSReady = true;
      }
      postMessage({ id, type: "LOAD_DS_PACKAGES_SUCCESS" });
    } catch (err) {
      postMessage({ id, type: "LOAD_DS_PACKAGES_ERROR", error: err.message || String(err) });
    }
    return;
  }

  if (type === "EXECUTE_DS") {
    if (!isDSReady) {
      postMessage({ id, type: "EXECUTE_ERROR", error: "데이터 사이언스 패키지(pandas/sklearn)가 아직 로드되지 않았습니다." });
      return;
    }
    try {
      pyodide.globals.set("__user_code__", userCode);
      pyodide.globals.set("__problem_id__", problemId || "");
      pyodide.globals.set("__validation_code__", validationCode || "");

      const runnerCode = `run_ds_judge(__user_code__, __problem_id__, __validation_code__)`;
      const rawResult = await pyodide.runPythonAsync(runnerCode);
      const parsedResult = JSON.parse(rawResult);

      postMessage({
        id,
        type: "EXECUTE_DS_SUCCESS",
        payload: parsedResult
      });
    } catch (err) {
      postMessage({
        id,
        type: "EXECUTE_ERROR",
        error: err.message || String(err)
      });
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
