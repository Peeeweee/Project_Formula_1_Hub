export const isPassingDemo=term=>term==='Overtake Mode'||term==='DRS';
// Move out first, pass with lateral clearance, then merge only once fully ahead.
export function passingCarPositions(progress){
 const p=Math.max(0,Math.min(1,progress));
 const smooth=t=>t*t*(3-2*t);
 if(p<.25)return {carX:2.6*smooth(p/.25),carZ:5.5,rivalX:0,rivalZ:0};
 if(p<.8)return {carX:2.6,carZ:5.5-11*smooth((p-.25)/.55),rivalX:0,rivalZ:0};
 return {carX:2.6*(1-smooth((p-.8)/.2)),carZ:-5.5,rivalX:0,rivalZ:0};
}
export function glossaryVisualState(term,step) {
 const state={carX:0,carZ:0,rivalX:0,rivalZ:8,label:'REFERENCE CAR',status:['SITUATION','MECHANISM','OUTCOME'][step]};
 if(['Undercut','Overcut','Box','Pit Window'].includes(term)){state.carZ=step===2?-1.3:step===1?.4:1;state.carX=term==='Overcut'?-1.2:step===1?-3:-1.2;state.label='STRATEGY EXAMPLE';state.status=step===2?'PIT CYCLE COMPLETE':step===1?'PIT / STINT COMPARISON':'TWO CARS / DIFFERENT PLANS';}
 if(term==='Safety Car'){state.carX=0;state.rivalX=0;state.rivalZ=step>0?5.5:8;state.status=step>0?'FIELD BUNCHING':'RACING GAPS';}
 if(term==='VSC'){state.carX=0;state.rivalX=0;state.label='MINIMUM TIME / DELTA';state.status=step>0?'TIME RESTRICTION ACTIVE':'RACING';}
 if(term==='Blue Flag'){state.rivalX=step>0?2.5:1.2;state.status=step>0?'LAPPED CAR YIELDS SAFELY':'LEADER APPROACHING';}
 if(term==='DNF'){state.carX=step>0?-3:-1.2;state.status=step>0?'RETIRED / STOPPED':'RUNNING';}
 if(term==='Jump Start'){state.carZ=step>0?-.8:0;state.status=step>0?'EARLY MOVEMENT / STEWARDS REVIEW':'WAIT FOR LIGHTS OUT';}
 if(term==='Purple Sector'){state.status=step>0?'OVERALL BEST SECTOR':'SECTOR IN PROGRESS';}
 if(term==='Delta Time'){state.rivalZ=8-step*.6;state.status=step>0?'GAP REDUCING / EXAMPLE':'COMPARE SAME TIMING LINE';}
 if(term==='Parc Fermé'){state.status=step>0?'SETUP RESTRICTIONS APPLY':'ENTER RESTRICTED PERIOD';}
 if(['Backmarker','Lapped Car'].includes(term)){state.carZ=step>0?-1:1;state.label='LEADER / LAPPED CAR';state.status=step>0?'DIFFERENT LAPS':'APPROACH';}
 if(term==='Push Lap'){state.carZ=-step;state.status=step>0?'PUSHING FOR LAP TIME':'PREPARE FLYING LAP';}
 if(['DRS','Active Aero'].includes(term)){state.status=step>0?'LOWER-DRAG CONFIGURATION':'CORNER CONFIGURATION';state.label=term==='DRS'?'REAR WING / HISTORICAL':'FRONT + REAR / 2026 SCHEMATIC';}
 if(['ERS','MGUK','MGUH','Overtake Mode','Quali Mode'].includes(term)){state.label='ENERGY / SCHEMATIC';state.status=term==='Overtake Mode'?['CHECK ELIGIBILITY','EXTRA DEPLOYMENT AVAILABLE','PASS NOT GUARANTEED'][step]:['ENERGY INPUT','RECOVER / STORE','DEPLOY WHEN PERMITTED'][step];}
 if(['Flat Spot','Graining','Blistering','Marbles'].includes(term)){state.label='TIRE SURFACE / SCHEMATIC';state.status=step>0?term.toUpperCase():'BASELINE TIRE';}
 if(term==='Halo'){state.status=step>0?'PROTECTIVE STRUCTURE HIGHLIGHTED':'COCKPIT REFERENCE';}
 if(isPassingDemo(term)){Object.assign(state,passingCarPositions(step===1?.525:step/2));state.label=term==='DRS'?'DRS / HISTORICAL PASS EXAMPLE':'OVERTAKE MODE / PASS EXAMPLE';state.status=['A FOLLOWS B','A PULLS ALONGSIDE B','A AHEAD / EXAMPLE'][step];}
 // Cars are 5.4 units long (0.8 scale in paired scenes). Keep a physical
 // clearance even when a teaching scenario brings both cars into one lane.
 if(!isPassingDemo(term) && Math.abs(state.rivalX-state.carX)<2.1 && Math.abs(state.rivalZ-state.carZ)<5.5){
  state.rivalZ=state.carZ+(state.rivalZ>=state.carZ?5.5:-5.5);
 }
 return state;
}
