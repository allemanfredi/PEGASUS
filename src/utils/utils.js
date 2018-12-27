
const startSession = () => {
    
    try{
        //set the current time
        const date = new Date();

        localStorage.setItem('session', date.getTime());
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

const checkSession = () => {
    
    try{
        const time = localStorage.getItem('session') 
        const date = new Date();
        const currentTime = date.getTime();
        if ( currentTime - time > 3600000 ) 
            return false;
        
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

const deleteSession = () => {
    try{
        localStorage.removeItem('session');
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

export { startSession,
         checkSession,
         deleteSession
        };
