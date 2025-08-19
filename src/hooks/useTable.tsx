import { useState, useEffect, useCallback } from "react";

interface UseTableDataParams<T, Q> {
    // 获取数据
    fetchFn: (query: Q) => Promise<{ data: T[]; total: number }>
    defaultQuery?: Q
}


export function useTableData<T = unknown, Q = Record<string, unknown>>({ fetchFn, defaultQuery }: UseTableDataParams<T, Q>) {

    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [query, setQuery] = useState<Q>(defaultQuery || ({} as Q));
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchFn(query);
            setData(res.data);
            setTotal(res.total);
        } catch (error) {
            console.log("Fetch Data Error:", error)
        } finally {
            setLoading(false);
        }
    }, [fetchFn, query])
    useEffect(() => {
        fetchData()

    }, [fetchData])
    return {
        data, loading, total, query, setQuery,
        reload: fetchData
    }
}