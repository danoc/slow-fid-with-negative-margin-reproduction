// This console.log's the FID. It is adapted from:
// https://web.dev/fid/#measure-fid-in-javascript

let firstHiddenTime = document.visibilityState === "hidden" ? 0 : Infinity;
document.addEventListener(
  "visibilitychange",
  (event) => {
    firstHiddenTime = Math.min(firstHiddenTime, event.timeStamp);
  },
  { once: true }
);

function consoleLogResults(data) {
  console.log(data);
}

// Use a try/catch instead of feature detecting `first-input`
// support, since some browsers throw when using the new `type` option.
// https://bugs.webkit.org/show_bug.cgi?id=209216
try {
  function onFirstInputEntry(entry, po) {
    // Only report FID if the page wasn't hidden prior to
    // the entry being dispatched. This typically happens when a
    // page is loaded in a background tab.
    if (entry.startTime < firstHiddenTime) {
      const fid = entry.processingStart - entry.startTime;

      // Disconnect the observer.
      po.disconnect();

      // Report the FID value to an analytics endpoint.
      consoleLogResults({ fid });
    }
  }

  // Create a PerformanceObserver that calls `onFirstInputEntry` for each entry.
  const po = new PerformanceObserver((entryList, po) => {
    entryList.getEntries().forEach((entry) => onFirstInputEntry(entry, po));
  });

  // Observe entries of type `first-input`, including buffered entries,
  // i.e. entries that occurred before calling `observe()` below.
  po.observe({
    type: "first-input",
    buffered: true,
  });
} catch (e) {
  // Do nothing if the browser doesn't support this API.
}
