// Deterministic reachability probe. No agent, no quota — plain HTTP from the
// runner, which has open outbound network (the dev sandbox does not).
//
// Its job is to establish which source URLs actually serve content to a
// machine, so `.github/sources.yaml` can hold VERIFIED urls instead of
// plausible ones. Several Canadian government and think-tank sites bot-block
// direct fetches; feeds usually do not.

/** Probe one URL. Never throws — a failure IS the result. */
export async function probeUrl(url, { timeoutMs = 15000, fetchImpl = fetch } = {}) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(url, { signal: controller.signal, redirect: "follow" });
    const body = await res.text();
    return {
      url,
      status: res.status,
      ok: res.ok && body.trim().length > 0,
      finalUrl: res.url || url,
      bytes: body.length,
      ms: Date.now() - started,
    };
  } catch (err) {
    return { url, status: 0, ok: false, finalUrl: url, bytes: 0, ms: Date.now() - started, error: err.name === "AbortError" ? "timeout" : err.message };
  } finally {
    clearTimeout(timer);
  }
}

/** One line per probe, aligned for a human reading a CI artifact. */
export function formatResults(results) {
  return results
    .map((r) => {
      const verdict = r.ok ? "OK  " : "FAIL";
      const detail = r.error ? r.error : `${r.status} ${r.bytes}b`;
      const redirect = r.finalUrl !== r.url ? ` -> ${r.finalUrl}` : "";
      return `${verdict} ${detail.padEnd(14)} ${r.url}${redirect}`;
    })
    .join("\n");
}

/** True when every probe succeeded. */
export function allReachable(results) {
  return results.length > 0 && results.every((r) => r.ok);
}
