export function validateRequest(request: Request, allowedHosts: RegExp[], allowLocal: boolean): boolean {
	const origin = request.headers.get("Origin");
	if (!origin) {
		console.warn("Request missing Origin header");
		return false;
	}
	const isValid = validateOrigin(origin, allowedHosts, allowLocal);
	if (!isValid) {
		console.warn(`Invalid origin: ${origin}`);
		return false;
	}
	const ip = request.headers.get("CF-Connecting-IP");
	console.log(`Accepting request from ${origin} (${ip})`);
	return true;
}


function validateOrigin(origin: string, allowedHosts: RegExp[], allowLocal: boolean): boolean {
	if (allowLocal && origin === "null") return true; // file URLs or similar

	let hostname;
	try {
		hostname = new URL(origin).hostname;
	} catch (e) { return false; }

	if (allowedHosts.some((p) => p.test(hostname))) {
		return true;
	}

	if (allowLocal && isLocalNetworkHost(hostname)) return true;

	return false;
}


let LOCAL_PATTERNS_RE: RegExp | undefined

function isLocalNetworkHost(hostname: string) {
  // Init lazily to avoid unnecessary work
  // unless this worker actually needs it

  const LOCAL_PATTERNS = [
    /localhost/,
    /.*\.local/,
    /.*\.ngrok.io/,
    // 10.0.0.0 - 10.255.255.255
    /10(?:\.\d{1,3}){3}/,
    // 127.0.0.0 - 127.255.255.255
    /127(?:\.\d{1,3}){3}/,
    // 169.254.1.0 - 169.254.254.255
    /169\.254\.([1-9]|1?\d\d|2[0-4]\d|25[0-4])\.\d{1,3}/,
    // 172.16.0.0 - 172.31.255.255
    /(172\.1[6-9]|172\.2\d|172\.3[01])(?:\.\d{1,3}){2}/,
    // 192.168.0.0 - 192.168.255.255
    /192\.168(?:\.\d{1,3}){2}/,
    // fc00::/7
    /\[f[cd][\da-f]{2}(:?:[\da-f]{1,4}){1,7}\]/,
    // fe80::/10
    /\[fe[89ab][\da-f](:?:[\da-f]{1,4}){1,7}\]/,
    // ::1
    /\[::1\]/,
    // ::ffff:7f00:1
    /\[::ffff:7f00:1\]/,
  ]

  // Concat all RegExes from above into one
  if (!LOCAL_PATTERNS_RE) LOCAL_PATTERNS_RE = new RegExp(`^(${LOCAL_PATTERNS.map((re) => re.source).join('|')})$`)
  return LOCAL_PATTERNS_RE.test(hostname)
}
