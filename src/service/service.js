

const addDevice = async device => {
    return new Promise((resolve,reject) => {
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
            .then(function(response){ 
                return response.json(); 
            })
            .then(function(data) {
                console.log(data);
            })
    })
    
}

const getAlltDevices = async () => {
    return new Promise((resolve,reject) => {
        fetch(
            "http://localhost:3000/api/getAll",
            {   method: 'GET',
                mode: 'no-cors',
                headers: new Headers(
                {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                })
             })          
             .then(function(response){ 
                response.json(); 
             })
             .then(function(data) {
                console.log(data);
             })
            
    }) 
}

export {
    addDevice,
    getAlltDevices
}