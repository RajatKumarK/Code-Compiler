import axios from 'axios';
import './App.css';
import React,{useState , useEffect} from 'react';
import stubs from './defaultStuds';
import moment from 'moment';
function App() {
  const [code, setCode] = useState("");
  const [language,setLanguage] = useState("cpp");
  const [output,setOutput] = useState("");
  const [status,setStatus] = useState("");
  const [jobId,setJobId] = useState("");
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() =>{
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  },[])
  useEffect(()=>{
    setCode(stubs[language]);
  },[language]);

  const setDefaultLanguage = () =>{
    localStorage.setItem("defaut-language",language);
    console.log(`${language} set as default language.`);
  }

  const renderTimeDetails = ()=>{
    if(!jobDetails){
    return "";
    }
   
    let result = '';
    let {submittedAt, completedAt, startedAt} = jobDetails;
    submittedAt = moment(submittedAt).toString();
    result+= `Submitted At: ${submittedAt}`;
    if(!completedAt || !startedAt){
      return result;
    }
    const start = moment(startedAt);
    const end = moment(completedAt);
    const executionTime =  end.diff(start,'seconds',true);
    result += `Execution Time: ${executionTime}s`;
    return result;
    
  }
  const handleSubmit = async ()=>{
    const payload = {
      language,
      code,
    };

    try{
      setJobId("");
      setStatus("");
      setOutput("");
      setJobDetails(null);
    const {data} = await axios.post("http://localhost:5000/run",payload);
    console.log(data);
    setJobId(data.jobId);

    let intervalId;
    intervalId = setInterval(async()=>{
      const {data : dataRes} = await axios.get("http://localhost:5000/status",{params:{id:data.jobId}});
      const{success,job,error} = dataRes;
      console.log(dataRes); 
      setJobDetails(job);

      if(success){
        const{ status : jobStatus , output : jobOutput} = job;
        setStatus(jobStatus);
        if(jobStatus==="pending")
        return;
        setOutput(jobOutput);
        clearInterval(intervalId);
      }else{
        setStatus("Error: Please retry");
        console.log(error);
        setOutput(error);
        clearInterval(intervalId);
      }
     
    },1000);

    }catch({response})
    {
      if(response){
        const errMsg = response.data.err.stderr;
        setOutput(errMsg);
      }
      else
      setOutput("Error connecting to server!");
    }
  }
  return (
    <div className="App">
      <h1>Online Code Compiler</h1>
      <div>
        <label>Language:</label>
        <select
        value={language}
        onChange={
          (e)=>{
            let response = window.confirm(
              "WARNING : Switching the language,will remove your current code.Do you want to proceed?"
            );
            if(response){
              setLanguage(e.target.value);
            }
          }
        }>
          <option value="cpp">C++</option>
          <option value="py">Python</option>
          {/* <option value="Java">Java</option>
          <option value="C">C</option> */}
        </select>
      </div>
      <br/>
      <div>
        <button onClick={setDefaultLanguage}>Set Default</button>
      </div>
      <br />
      <textarea 
      rows="20" 
      cols="75" 
      value={code} 
      onChange={(e) =>{
        setCode(e.target.value);
      }}></textarea>
      <br />
      <button onClick={handleSubmit}>Submit</button>
      <p>{status}</p>
      <p>{jobId && `JobID: ${jobId}`}</p>
      <p>{renderTimeDetails()}</p>
      <p>{`Output:- ${output}`}</p>
    </div>
  );
}

export default App;
