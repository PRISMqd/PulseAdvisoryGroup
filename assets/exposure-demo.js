(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.PulseExposureDemo=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const LIMITS={fte:[1,100000],turnoverPercent:[0,100],vacancyDays:[0,365],patientsPerVacancyDay:[0,10],replacementCost:[0,1000000],reportedAmount:[0,1e12],additionalExposure:[0,1e12]};
  const CONTEXTS=["credit-lending","transaction-diligence","insurance","governance","counsel","other"];
  const FTE_BASES=["denominator-matched-fte","enterprise-headcount-proxy","other"];
  function numberInput(value,key){const x=Number(value),[min,max]=LIMITS[key];if(!Number.isFinite(x)||x<min||x>max)throw new Error(`${key} must be between ${min} and ${max}.`);return x}
  function choice(value,allowed,fallback){return allowed.includes(value)?value:fallback}
  function normalize(value){return{fte:numberInput(value.fte,"fte"),turnoverPercent:numberInput(value.turnoverPercent,"turnoverPercent"),vacancyDays:numberInput(value.vacancyDays,"vacancyDays"),patientsPerVacancyDay:numberInput(value.patientsPerVacancyDay??.5,"patientsPerVacancyDay"),replacementCost:numberInput(value.replacementCost,"replacementCost"),reportedAmount:numberInput(value.reportedAmount||0,"reportedAmount"),additionalExposure:numberInput(value.additionalExposure||0,"additionalExposure"),decisionContext:choice(value.decisionContext,CONTEXTS,"other"),fteBasis:choice(value.fteBasis,FTE_BASES,"other")}}
  function build(value){
    const input=normalize(value);
    const estimatedDepartures=input.fte*input.turnoverPercent/100;
    const vacancyFteDays=estimatedDepartures*input.vacancyDays;
    const replacementScenario=estimatedDepartures*input.replacementCost;
    const combinedScenario=replacementScenario+input.additionalExposure;
    const modeledPatientCareDays=vacancyFteDays*input.patientsPerVacancyDay;
    return{estimatedDepartures,vacancyFteDays,replacementScenario,combinedScenario,scenarioDifference:combinedScenario-input.reportedAmount,reportedComparisonAvailable:input.reportedAmount>0,modeledPatientCareDays,phcReportedRateSensitivity:modeledPatientCareDays*.029*24826,mamoduleStatus:"DATA NOT SUFFICIENT",drivers:{departuresAvoidedPer1pp:input.fte*.01,costPer1ppTurnover:input.fte*.01*input.replacementCost,replacementCostSensitivityPer1000:estimatedDepartures*1000,patientCareDaysPer1pp:input.fte*.01*input.vacancyDays*input.patientsPerVacancyDay,patientCareDaysPer10VacancyDays:estimatedDepartures*10*input.patientsPerVacancyDay},previewBrief:`${input.decisionContext.replace(/-/g," ")} screening with ${input.fteBasis.replace(/-/g," ")} inputs. The paid report separates arithmetic, sensitivities, evidence gates, and next-data priorities.`}
  }
  function money(value){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(value)}
  function number(value,digits){return new Intl.NumberFormat("en-US",{maximumFractionDigits:digits}).format(value)}
  return{build,money,number};
});
