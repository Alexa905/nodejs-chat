module.exports = {
    transformResponse(data){
        return data.sort((a, b)=>(a.name.localeCompare(b.name))).reduce((allClientsMap, user) => {
            allClientsMap[user.name] = user;
            return allClientsMap;
        }, {})
    },
    sortObject(obj){
        return Object.keys(obj).sort((a, b)=>(a.localeCompare(b))).reduce((map, key) => {
            map[key] = obj[key];
            return map;
        }, {})
    }
};