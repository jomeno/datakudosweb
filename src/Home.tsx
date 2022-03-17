import { Link } from "react-router-dom"


export function RelatedDatasetCard(props : {dataset?:dataset, handleFieldClick?:any, datasetIndex:number}){

    if(!props || !props.dataset) return <></>

    let dataset = props.dataset;


    return(
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{dataset.name}</h5>
            <p className="card-text">{false ? 'Click to add or remove' : 'Maybe some basic instruction here for user guidance.'}</p>                    
            
            <div className="mb-3">
              {
                dataset.fields.map((field: field, index: number)=>{
                  return <FieldTag fieldTag={field} handleFieldClick={()=> props.handleFieldClick(props.datasetIndex, index)} fieldIndex={index} key={index}></FieldTag>
                })
              }
              
              {/* <Link to="#"><span className="badge rounded-pill bg-light text-dark me-1">Compensation Plan</span></Link>
              <Link to="#"><span className="badge rounded-pill bg-light text-dark me-1">Height</span></Link> */}
            </div>
            <p className="card-text"><small className="text-muted">Last updated 3 mins ago</small></p>
          </div>
        </div>
      )
}

export function FieldTag(props:any){
    //console.log('props.fieldIndex', props.fieldIndex)
    return (
        <Link to="#" onClick={()=>props.handleFieldClick(0, props.fieldIndex)}>
            <span className={props.field?.isSelected === true? 'badge rounded-pill bg-light text-dark border border-secondary me-1' : 'badge rounded-pill bg-light text-dark me-1'}>
                {props.fieldTag.name}
            </span>
        </Link>
    )

}
