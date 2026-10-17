import Cookies from "js-cookie";

// Removes the cookies whose name matches, on the exact host and on every parent domain
// (www.macar.be, macar.be), since Google and Meta may have set them on either.
export function removeCookies(matches: (name: string) => boolean): void {
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0].trim())
    .filter((name) => name && matches(name));
  const labels = window.location.hostname.split(".");
  const domains: string[] = [];
  for (let i = 0; i <= labels.length - 2; i++) domains.push(labels.slice(i).join("."));
  for (const name of names) {
    Cookies.remove(name, { path: "/" });
    for (const domain of domains) Cookies.remove(name, { path: "/", domain });
  }
}
