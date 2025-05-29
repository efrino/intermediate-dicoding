export function showFormattedDate(date, locale = 'en-US', options = {}) {
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        ...options,
    });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function saveUserData({ name, token }) {
  localStorage.setItem('userName', name);
  localStorage.setItem('accessToken', token);
}

export function getUserData() {
  return {
    name: localStorage.getItem('userName'),
    token: localStorage.getItem('accessToken'),
  };
}

export function clearUserData() {
  localStorage.removeItem('userName');
  localStorage.removeItem('accessToken');
}

export function isUserLoggedIn() {
  const { token } = getUserData();
  return !!token;
}