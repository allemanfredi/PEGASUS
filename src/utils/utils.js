

const startSession = () => {
    
    try{
        localStorage.setItem('logged', 'true');
        return true;
    }
    catch(err){
        console.log(err);
        return false;
    }
}

const checkSession = () => {
    
    try{
        if ( localStorage.getItem('logged') === 'true' )
            return true;
        else
            return false;
    }
    catch(err){
        console.log(err);
        return false;
    }
}


export { startSession,
         checkSession,
        };
