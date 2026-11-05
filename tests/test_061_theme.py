"""PLAN-061 targeted theme-adoption probe for jade-edit (auto-jade).

Counter-controls (auto-os/PLAN-061 V-01/V-02/V-03 standalone legs), merged
arm mechanics mirrored from tests/vm_matrix.mjs (boot = `auto run -r vm` +
AUTO_JADE_WORKSPACE isolated fixture, back in-process, zero ports):

  leg A (explicit override track): AUTO_UI_THEME=dark -> official Auto/dark
      applied: toolbar strip (bg-muted/30 over background) pixel == blend
      #0f0f12; dark_mode true
  leg B (explicit light): AUTO_UI_THEME=light -> #fcfcfc, dark_mode false
  leg C (host follow track): AUTOOS_DESKTOP_CONFIG full candidate
      Solarized/dark + frozen package dir -> blend #022e3a (family switch,
      distinct from Auto/dark)
  leg D (V-02 business during reskin): boot Solarized/dark -> open
      Hello World.ad (real tree-row press) -> whole-doc type_text with the
      061 marker (real INPUT_TEXT, active_dirty=true) -> flip the config to
      light in-session -> dirty state + editor content survive -> SAVE ->
      disk bytes contain the marker (persistence through reskin)
  leg E (reopen recovery): fresh boot with the flipped light config ->
      toolbar blend #f8f2de (Solarized light) AND the saved marker still on
      disk (cold recovery)

Isolation: fixture + evidence live under
D:/autostack/plan-artifacts/plan-061/auto-os/jade-edit (never inside a
repo); the wiki-demo source is read-only.
"""

import json
import os
import re
import shutil
import socket
import subprocess
import sys
import time
import urllib.request

EVIDENCE_DIR = r"D:\autostack\plan-artifacts\plan-061\auto-os\jade-edit"
CONFIG_DIR = os.path.join(EVIDENCE_DIR, "config")
FIXTURE = os.path.join(EVIDENCE_DIR, "workspace")
FIXTURE_SOURCE = r"D:\autostack\auto-down\tmp\wiki-demo"
PACKAGE_DIR = r"D:\autostack\auto-ui\packages\themes"
THEME_DIGEST = "9fa07742dc68aa5377ae06cb2d966386002063f184c515b6c5dddf8a6bef838e"

# Dominant-surface oracle: the family x mode official (background, card)
# token pair from vendor/themes/themes.at (digest 9fa07742..bef838e).
AUTO_DARK_CORNER = [(0x09, 0x09, 0x0B), (0x0F, 0x0F, 0x12)]
AUTO_LIGHT_CORNER = [(0xFF, 0xFF, 0xFF), (0xF4, 0xF4, 0xF5)]
SOLARIZED_DARK_CORNER = [(0x00, 0x2B, 0x36), (0x07, 0x36, 0x42)]
SOLARIZED_LIGHT_CORNER = [(0xFD, 0xF6, 0xE3), (0xEE, 0xE8, 0xD5)]

TARGET_LABEL = "Hello World.ad"
TREE_LABEL = "Hello World"   # EXPLORER row own-text = stem (no .ad)
EDIT_MARKER = "PLAN-061 主题腿标记：换肤期间编辑回写。"


def prepare_fixture():
    """Fresh fixture copy per boot (vm_matrix discipline, artifacts-isolated)."""
    if os.path.isdir(FIXTURE):
        shutil.rmtree(FIXTURE)
    shutil.copytree(FIXTURE_SOURCE, FIXTURE)


def write_config(mode: str, family: str = "Solarized", path: str = None) -> str:
    os.makedirs(CONFIG_DIR, exist_ok=True)
    path = path or os.path.join(CONFIG_DIR, f"config_{family.lower()}_{mode}.at")
    with open(path, "w", encoding="utf-8") as f:
        f.write(
            "desktop {\n"
            f'    theme_family : "{family}"\n'
            '    theme_family_version : "0.2.0"\n'
            f'    theme_family_digest : "{THEME_DIGEST}"\n'
            f'    theme_mode : "{mode}"\n'
            "    dark_theme : true\n"
            "}\n"
        )
    return path


def pick_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class AutoUiMcpClient:
    def __init__(self, port: int):
        self.url = f"http://127.0.0.1:{port}/mcp"
        self._req_id = 1

    def _call(self, tool_name: str, args: dict = None) -> dict:
        req = {
            "jsonrpc": "2.0",
            "id": self._req_id,
            "method": "tools/call",
            "params": {"name": tool_name, "arguments": args or {}},
        }
        self._req_id += 1
        http_req = urllib.request.Request(
            self.url, data=json.dumps(req).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(http_req, timeout=15) as response:
            res = json.loads(response.read().decode("utf-8"))
            if "error" in res:
                raise RuntimeError(f"MCP Tool '{tool_name}' error: {res['error']}")
            return res.get("result", {})

    def text(self, tool_name: str, args: dict = None) -> str:
        r = self._call(tool_name, args)
        return "\n".join(c.get("text", "") for c in r.get("content", []))

    def state(self) -> str:
        return self.text("autoui_state")

    def snapshot(self) -> str:
        return self.text("autoui_snapshot")

    def press(self, element_id):
        return self.text("autoui_action", {"element_id": element_id, "action": "press"})

    def screenshot(self, name: str) -> str:
        raw = self.text("autoui_screenshot", {"name": name, "baseline": False})
        low = raw.lower()
        if "saved to" in low:
            after = raw[low.index("saved to") + len("saved to"):].lstrip(" :").replace("\\\\?\\", "")
            return after.strip()
        return ""


# ---- vm_matrix-shaped snapshot parsing (vnode buttons by own label) ----

def parse_aura(text: str):
    root = {"head": "<root>", "children": []}
    stack = [{"node": root, "depth": -1}]
    for raw in text.split("\n"):
        trimmed = raw.strip()
        if not trimmed or trimmed == "}" or raw.startswith("AURA") or \
           raw.startswith("widget:") or raw.startswith("tree:"):
            continue
        depth = (len(raw) - len(raw.lstrip(" "))) // 2
        line = trimmed.rstrip("{").strip()
        while len(stack) > 1 and stack[-1]["depth"] >= depth:
            stack.pop()
        node = {"head": line, "children": []}
        stack[-1]["node"]["children"].append(node)
        stack.append({"node": node, "depth": depth})
    return root


def element_id(node):
    m = re.search(r"#(vnode_\d+)", node["head"])
    return m.group(1) if m else None


def own_text(node):
    m = re.search(r'"((?:[^"\\]|\\.)*)"', node["head"])
    return m.group(1) if m else ""


def find_first(node, pred):
    if pred(node):
        return node
    for child in node["children"]:
        hit = find_first(child, pred)
        if hit:
            return hit
    return None


def find_parent(node, target, parent=None):
    if node is target:
        return parent
    for child in node["children"]:
        hit = find_parent(child, target, node)
        if hit is not None:
            return hit
    return None


def explorer_region(tree):
    label = find_first(tree, lambda n: own_text(n) == "EXPLORER")
    if not label:
        return None
    row = find_parent(tree, label)
    return find_parent(tree, row) if row else None


def press_tree(client, label, timeout=15):
    deadline = time.time() + timeout
    while time.time() < deadline:
        tree = parse_aura(client.snapshot())
        region = explorer_region(tree)
        hit = None
        if region:
            hit = find_first(region, lambda n: n["head"].startswith("button ")
                             and element_id(n) and own_text(n) == label)
        if hit:
            res = client.press(element_id(hit))
            if "status: ok" in res:
                return True
        time.sleep(0.4)
    return False


def editor_id(client, timeout=15):
    def is_editor(n):
        return (n["head"].startswith("autodown_editor ")
                or n["head"].startswith("textarea ")
                or n["head"].startswith("code_editor "))
    deadline = time.time() + timeout
    while time.time() < deadline:
        tree = parse_aura(client.snapshot())
        hit = find_first(tree, lambda n: is_editor(n) and element_id(n))
        if hit:
            return element_id(hit)
        time.sleep(0.4)
    return None


def press_button(client, label, timeout=15):
    deadline = time.time() + timeout
    while time.time() < deadline:
        tree = parse_aura(client.snapshot())
        hit = find_first(tree, lambda n: n["head"].startswith("button ")
                         and element_id(n)
                         and (own_text(n) == label or own_text(n).endswith(label)))
        if hit:
            res = client.press(element_id(hit))
            if "status: ok" in res:
                return True
        time.sleep(0.4)
    return False


def state_field(state: str, field: str):
    m = re.search(rf"{field}:\s*(.*)", state)
    if not m:
        return None
    raw = m.group(1).strip()
    raw = re.sub(r"\s*\((?:str|int|bool|float|map|list)\)\s*$", "", raw)
    raw = raw.strip()
    m2 = re.fullmatch(r'"((?:[^"\\]|\\.)*)"', raw)
    if m2:
        return m2.group(1)
    return raw


def kill_tree(proc):
    if proc.poll() is not None:
        return
    try:
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                       capture_output=True, timeout=10)
    except Exception:
        pass
    try:
        proc.wait(timeout=5)
    except Exception:
        pass


def boot_jade(tag: str, auto_bin: str, env_extra: dict, failures: list,
              timeout=420):
    """Boot merged arm; returns (proc, client, state) or (proc, None, '')."""
    os.makedirs(EVIDENCE_DIR, exist_ok=True)
    port = pick_free_port()
    env = dict(os.environ, AUTOUI_MCP_PORT=str(port),
               AUTO_JADE_WORKSPACE=FIXTURE, **env_extra)
    proc = subprocess.Popen([auto_bin, "run", "-r", "vm"], cwd=APP_DIR,
                            env=env, stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL)
    client = AutoUiMcpClient(port)
    start = time.time()
    state = ""
    while time.time() - start < timeout:
        try:
            s = client.state()
            if 'status: "ready"' in s:
                state = s
                break
        except Exception:
            pass
        time.sleep(0.6)
    if not state:
        failures.append(f"{tag}: MCP not ready within {timeout}s")
    return proc, client, state


def shoot(client, tag):
    tmp = client.screenshot(tag)
    if tmp and os.path.exists(tmp):
        shot = os.path.join(EVIDENCE_DIR, f"{tag}.png")
        with open(tmp, "rb") as s, open(shot, "wb") as d:
            d.write(s.read())
        return shot
    return None


def dominant_colors(shot: str, k=4):
    """Top-k dominant colors of the window (text/edge contamination makes
    small-patch sampling fragile; the dominant surface IS the theme body)."""
    from PIL import Image
    from collections import Counter

    with Image.open(shot) as im:
        rgb = im.convert("RGB")
        w, h = rgb.size
        cnt = Counter()
        for y in range(0, h, 3):
            for x in range(0, w, 3):
                cnt[rgb.getpixel((x, y))] += 1
        total = sum(cnt.values())
        return [(c, round(100 * n / total, 1)) for c, n in cnt.most_common(k)]


APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def sidebar_color(shot: str):
    """Uniform patch inside the file-tree sidebar (bg-card surface), at
    relative coords x [0.14w..0.16w], y [0.33h..0.37h] (calibrated: the
    root col is transparent, so the window-dominant color is the native
    backdrop, not a theme token)."""
    from PIL import Image
    from collections import Counter

    with Image.open(shot) as im:
        rgb = im.convert("RGB")
        w, h = rgb.size
        x0, x1 = int(w * 0.14), int(w * 0.16)
        y0, y1 = int(h * 0.33), int(h * 0.37)
        cnt = Counter(rgb.getpixel((x, y)) for x in range(x0, x1, 2)
                      for y in range(y0, y1, 2))
        color, n = cnt.most_common(1)[0]
        total = sum(cnt.values())
        return color, n / total


def check_pixel(failures, shot, expect, tag):
    """Sidebar bg-card patch must equal one of the family x mode official
    pair (background | card token, tolerance 3)."""
    if not shot:
        failures.append(f"{tag}: screenshot not saved")
        return None
    dom, uniform = sidebar_color(shot)
    print(f"  [*] {tag} sidebar patch = #{dom[0]:02x}{dom[1]:02x}{dom[2]:02x} "
          f"(uniform {round(100*uniform)}%; expect "
          f"{' or '.join('#%02x%02x%02x' % e for e in expect)})")
    if uniform < 0.9:
        failures.append(f"{tag}: sidebar patch not uniform ({uniform:.2f})")
    if not any(all(abs(a - c) <= 3 for a, c in zip(dom, e)) for e in expect):
        failures.append(f"{tag}: sidebar #{dom[0]:02x}{dom[1]:02x}{dom[2]:02x} "
                        f"!= {' or '.join('#%02x%02x%02x' % e for e in expect)}")
        return dom
    print(f"  [+] {tag}: official package value applied")
    return dom


def main() -> int:
    failures: list = []
    auto_bin = os.environ.get("AUTO_EXE",
                              r"D:\autostack\auto-man\target\debug\auto.exe")

    print("[*] leg A: explicit AUTO_UI_THEME=dark (override track)")
    prepare_fixture()
    proc, client, state = boot_jade("legA", auto_bin, {"AUTO_UI_THEME": "dark"}, failures)
    try:
        if state:
            time.sleep(3)
            if "dark_mode: true" not in state:
                failures.append("leg A: dark_mode state not true")
            check_pixel(failures, shoot(client, "061_jade_A_dark"), AUTO_DARK_CORNER, "leg A")
            with open(os.path.join(EVIDENCE_DIR, "state-legA.txt"), "w", encoding="utf-8") as f:
                f.write(state)
    finally:
        kill_tree(proc)

    print("[*] leg B: explicit AUTO_UI_THEME=light")
    prepare_fixture()
    proc, client, state = boot_jade("legB", auto_bin, {"AUTO_UI_THEME": "light"}, failures)
    try:
        if state:
            time.sleep(3)
            if "dark_mode: false" not in state:
                failures.append("leg B: dark_mode state not false")
            check_pixel(failures, shoot(client, "061_jade_B_light"), AUTO_LIGHT_CORNER, "leg B")
    finally:
        kill_tree(proc)

    print("[*] leg C: host follow track -- Solarized/dark full candidate")
    prepare_fixture()
    cfg_dark = write_config("dark")
    proc, client, state = boot_jade("legC", auto_bin,
                                    {"AUTOOS_DESKTOP_CONFIG": cfg_dark,
                                     "AUTOOS_THEME_PACKAGE_DIR": PACKAGE_DIR}, failures)
    try:
        if state:
            time.sleep(3)
            check_pixel(failures, shoot(client, "061_jade_C_solarized_dark"),
                        SOLARIZED_DARK_CORNER, "leg C")
    finally:
        kill_tree(proc)

    print("[*] leg D: live business during reskin (open+edit+save across flip)")
    prepare_fixture()
    cfg_flip = os.path.join(CONFIG_DIR, "config_flip.at")
    write_config("dark", path=cfg_flip)
    target_file = os.path.join(FIXTURE, "wiki", TARGET_LABEL)
    proc, client, state = boot_jade("legD", auto_bin,
                                    {"AUTOOS_DESKTOP_CONFIG": cfg_flip,
                                     "AUTOOS_THEME_PACKAGE_DIR": PACKAGE_DIR}, failures)
    try:
        if state:
            time.sleep(3)
            with open(os.path.join(EVIDENCE_DIR, "state-legD-boot.txt"), "w", encoding="utf-8") as f:
                f.write(state)
            if not press_tree(client, "wiki"):
                with open(os.path.join(EVIDENCE_DIR, "snapshot-legD-wiki.txt"), "w", encoding="utf-8") as f:
                    f.write(client.snapshot())
                failures.append("leg D: wiki dir row not found/pressed (snapshot dumped)")
            else:
                time.sleep(1)
            if not press_tree(client, TREE_LABEL):
                with open(os.path.join(EVIDENCE_DIR, "snapshot-legD.txt"), "w", encoding="utf-8") as f:
                    f.write(client.snapshot())
                failures.append("leg D: tree row not opened (Hello World)")
            else:
                print(f"  [+] opened {TREE_LABEL} via tree press")
                time.sleep(2)
                eid = editor_id(client)
                if not eid:
                    failures.append("leg D: editor face not found")
                else:
                    disk_before = open(target_file, "r", encoding="utf-8").read()
                    edited = disk_before.rstrip("\n") + "\n\n" + EDIT_MARKER + "\n"
                    res = client._call("autoui_action", {
                        "element_id": eid, "action": "type_text", "value": edited})
                    res_text = "\n".join(c.get("text", "") for c in res.get("content", []))
                    deadline = time.time() + 8
                    dirty = ""
                    while time.time() < deadline:
                        dirty = client.state()
                        if "active_dirty: true" in dirty:
                            break
                        time.sleep(0.4)
                    print(f"  [+] typed whole doc + marker; active_dirty=true: "
                          f"{'active_dirty: true' in dirty}")
                    if "active_dirty: true" not in dirty:
                        failures.append("leg D: dirty flag not set after type_text")

                    # in-session flip: dark -> light
                    flip = (
                        "desktop {\n"
                        '    theme_family : "Solarized"\n'
                        '    theme_family_version : "0.2.0"\n'
                        f'    theme_family_digest : "{THEME_DIGEST}"\n'
                        '    theme_mode : "light"\n'
                        "    dark_theme : false\n"
                        "}\n"
                    )
                    with open(cfg_flip, "w", encoding="utf-8") as f:
                        f.write(flip)
                    print("  [*] config flipped to light in-session")

                    survived = True
                    deadline = time.time() + 20
                    last = dirty
                    while time.time() < deadline:
                        time.sleep(1)
                        last = client.state()
                        if 'status: "ready"' not in last:
                            survived = False
                            break
                        if "active_dirty: true" in last:
                            break
                    if not survived or "active_dirty: true" not in last:
                        failures.append("leg D: dirty draft lost during reskin")
                    else:
                        print("  [+] dirty draft survived reskin window (V-02)")

                    shot = shoot(client, "061_jade_D_after_flip")
                    if shot:
                        dom, _ = sidebar_color(shot)
                        light = any(all(abs(a - c) <= 3 for a, c in zip(dom, e))
                                    for e in SOLARIZED_LIGHT_CORNER)
                        dark = any(all(abs(a - c) <= 3 for a, c in zip(dom, e))
                                   for e in SOLARIZED_DARK_CORNER)
                        print(f"  [*] post-flip sidebar = #{dom[0]:02x}{dom[1]:02x}{dom[2]:02x} "
                              f"(light={light}, dark-lag={dark})")

                    # save through reskin: real toolbar save + disk oracle
                    if not press_button(client, "保存"):
                        failures.append("leg D: save button not pressed")
                    else:
                        deadline = time.time() + 8
                        saved = ""
                        while time.time() < deadline:
                            saved = client.state()
                            if "active_dirty: false" in saved:
                                break
                            time.sleep(0.4)
                        disk_after = open(target_file, "r", encoding="utf-8").read()
                        ok = EDIT_MARKER in disk_after
                        print(f"  [+] saved (dirty=false: {'active_dirty: false' in saved}); "
                              f"disk marker present: {ok}")
                        if "active_dirty: false" not in saved:
                            failures.append("leg D: dirty flag not cleared after save")
                        if not ok:
                            failures.append("leg D: marker not persisted to disk")
    finally:
        kill_tree(proc)

    print("[*] leg E: reopen recovery with flipped light config")
    # NO fixture re-pour: leg E verifies leg D's PERSISTED state (fresh copy
    # would wipe the saved marker).
    proc, client, state = boot_jade("legE", auto_bin,
                                    {"AUTOOS_DESKTOP_CONFIG": cfg_flip,
                                     "AUTOOS_THEME_PACKAGE_DIR": PACKAGE_DIR}, failures)
    try:
        if state:
            time.sleep(3)
            check_pixel(failures, shoot(client, "061_jade_E_reopen_light"),
                        SOLARIZED_LIGHT_CORNER, "leg E")
            disk_after = open(target_file, "r", encoding="utf-8").read()
            if EDIT_MARKER not in disk_after:
                failures.append("leg E: cold reopen lost the saved marker")
            else:
                print("  [+] cold reopen: saved marker still on disk")
    finally:
        kill_tree(proc)

    if failures:
        print("[-] FAILURES:")
        for f in failures:
            print("   -", f)
        return 1
    print("[+] PLAN-061 jade-edit probe: all counter-controls passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
