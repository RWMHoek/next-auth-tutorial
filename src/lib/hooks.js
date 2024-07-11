import { useEffect, useState } from "react";

export function useLoadingErrorState(initialState) {
    const [ state, setState ] = useState(initialState);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    return [ state, setState, loading, setLoading, error, setError];
}

export function useClientSideAsyncCall(call, args, initialState, noDataError) {
    const [ state, setState, loading, setLoading, error, setError ] = useLoadingErrorState(initialState);

    useEffect(() => {
        async function getData() {
            try {
                const data = await call(...args);
                
                if (!result) {
                    setError(noDataError ? noDataError : "No Data!");
                } else {
                    setState(data);
                }
            } catch (error) {
                setError(error);
            }

            setLoading(false);
        }

        getData();
    }, []);

    return [ state, setState, loading, error];
}