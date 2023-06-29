//create a custom module for returning the current date
exports.getDate = () => {
    const today = new Date();
    const options = {
        weekday: "short",
        day: "2-digit",
        month: "long"
        
    };
    return today.toLocaleDateString("en-us", options);
}