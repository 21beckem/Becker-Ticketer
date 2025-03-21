HTMLCollection.prototype.forEach = Array.from(this).forEach;

// confirm before page refresh because you'll lose ticket progress.
window.onbeforeunload = function(event) {
    return "Are you sure you want to refresh the page?";
};
