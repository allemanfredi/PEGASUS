

const addDevice = async (device , callback) => {
    fetch(
        'http://localhost:3000/api/add',
        {   method: 'POST',
            mode: 'no-cors',
            headers: new Headers(
            {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; application/json'}
            ),
            body: JSON.stringify(device)
        })
        .then(function(response) {
            return response.json();
        }).then(function(res) {
            callback(res);
        });
}

const getAllDevices = async callback => {

    fetch(
        "http://localhost:3000/api/getAll",
        {   method: 'GET',
            headers: new Headers(
            {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            })
    })  
    .then(function(response) {
        return response.json();
    }).then(function(res) {
        callback(res);
    });
}

export {
    addDevice,
    getAllDevices
}