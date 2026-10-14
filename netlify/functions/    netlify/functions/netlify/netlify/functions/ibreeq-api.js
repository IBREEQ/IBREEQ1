const { getStore } = require("@netlify/blobs");
const ADMIN_CODE=process.env.IBREEQ_ADMIN_CODE||".IBREEQ11";
const store=getStore("ibreeq-job-applications");
async function getJson(k,f){const v=await store.get(k,{type:"json"});return v??f}
async function putJson(k,v){await store.setJSON(k,v)}
const res=(s,b)=>({statusCode:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"},body:JSON.stringify(b)});
exports.handler=async(event)=>{
 if(event.httpMethod!=="POST")return res(405,{error:"Method not allowed"});
 try{
  const b=JSON.parse(event.body||"{}");
  if(b.action==="login")return res(200,{ok:b.code===ADMIN_CODE});
  if(b.action==="getFields")return res(200,{fields:await getJson("fields",[])});
  if(b.action==="submitApplication"){
   const apps=await getJson("applications",[]);
   apps.unshift({id:crypto.randomUUID(),createdAt:new Date().toISOString(),values:b.values||{}});
   await putJson("applications",apps);return res(200,{ok:true});
  }
  if(b.code!==ADMIN_CODE)return res(401,{error:"Unauthorized"});
  if(b.action==="listApplications")return res(200,{applications:await getJson("applications",[])});
  if(b.action==="deleteApplication"){
   const apps=await getJson("applications",[]);await putJson("applications",apps.filter(x=>x.id!==b.id));return res(200,{ok:true});
  }
  if(b.action==="saveFields"){await putJson("fields",Array.isArray(b.fields)?b.fields:[]);return res(200,{ok:true})}
  return res(400,{error:"Unknown action"});
 }catch(e){console.error(e);return res(500,{error:"Server error"})}
};
