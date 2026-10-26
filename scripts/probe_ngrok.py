import httpx

url = "https://proxy-service-editor.ngrok-free.dev"
r = httpx.get(url, headers={"ngrok-skip-browser-warning": "true", "User-Agent": "Mozilla/5.0"}, follow_redirects=True, timeout=10.0)
print("Status:", r.status_code)
print("Headers:", dict(r.headers))
print("Body:", r.text[:500])
