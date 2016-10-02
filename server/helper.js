module.exports = {
    transformResponse(data){
        var allClients = {};
        data.sort((a, b)=>(a.name.localeCompare(b.name))).forEach((user)=> {
            allClients[user.name] = user
        });
        return allClients;
    },

    sortObject(obj){
        var sorted = {};
        Object.keys(obj).sort((a, b)=>(a.localeCompare(b))).forEach((key)=> {
            sorted[key] = obj[key]
        });
        return Object.assign({}, sorted);
    }
};