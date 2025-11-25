let clicks = 0;
document.getElementById("clickBtn").addEventListener("click", () => {
    click();
});
function click() {
    clicks++;
    document.getElementById("clicksCounter").textContent = clicks;
}
