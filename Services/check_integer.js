function checkInteger(n) {
    return !isNaN(n) && n == parseInt(n, 10);
}

export { checkInteger };