import { describe, expect, it, vi } from "vitest";
import { handleGetSessionStream } from "./sessions.controller.js";

const SESSION_ID = "9bf184a4-b624-4c5e-ab50-4d028cf85957";

function setup() {
  const server = {
    sessionService: {
      activeSession: {
        id: SESSION_ID,
        dimensions: { width: 1920, height: 1080 },
      },
    },
  } as any;
  const view = vi.fn();
  const reply = { view } as any;
  return { server, view, reply };
}

describe("handleGetSessionStream", () => {
  it("points the viewer websocket at the active session", async () => {
    const { server, view, reply } = setup();

    await handleGetSessionStream(server, { query: {} } as any, reply);

    expect(view).toHaveBeenCalledTimes(1);
    const [template, data] = view.mock.calls[0];
    expect(template).toBe("live-session-streamer.ejs");
    expect(data.wsUrl).toContain(`/v1/sessions/${SESSION_ID}/cast`);
    expect(data.wsUrl.endsWith(`/v1/sessions/${SESSION_ID}/cast`)).toBe(true);
    expect(data.singlePageMode).toBe(false);
  });

  it("keeps the session id in the path when a pageId is requested", async () => {
    const { server, view, reply } = setup();

    await handleGetSessionStream(server, { query: { pageId: "ABC123" } } as any, reply);

    const [, data] = view.mock.calls[0];
    expect(data.wsUrl).toContain(`/v1/sessions/${SESSION_ID}/cast?pageId=ABC123`);
    expect(data.singlePageMode).toBe(true);
  });
});
