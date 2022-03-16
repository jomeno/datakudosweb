import { useEffect, useState } from 'react';

export default function Home(){

    const [datasets, setDatasets] = useState<number[]>([]) 

    useEffect(()=>{
        setDatasets([1,2,3,4])
        console.log('datasets', datasets)

    }, [datasets])

}