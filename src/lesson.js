export const STAGE_SECONDS = 10;
export const STEPS = [
  { name:'Set up', title:'Meet your<br><em>miniature lab.</em>', text:'A mixture of two liquids sits in the flask. Their boiling points are close, so a single evaporation and condensation would not separate them well.', note:'The extra ingredient? <b>A fractionating column.</b> It makes repeated separation possible.', part:'column' },
  { name:'Heat', title:'A little heat.<br><em>A rising vapour.</em>', text:'Heating gives molecules enough energy to escape into the vapour. Both liquids can vaporise, but the vapour is richer in the more volatile liquid A.', note:'<b>More volatile</b> means a greater tendency to vaporise at a given temperature.', part:'flask' },
  { name:'Fractionate', title:'The column does<br><em>the clever part.</em>', text:'Vapour rises while condensed liquid flows down. Repeated condensation and vaporisation make the rising vapour progressively richer in liquid A.', note:'Hotter at the bottom → cooler at the top.<br><b>Each cycle improves enrichment.</b>', part:'column' },
  { name:'Condense', title:'Cool the vapour.<br><em>Keep the liquid.</em>', text:'Enriched vapour enters the condenser. Cooling water removes heat through the glass, turning the vapour back into liquid.', note:'Cooling water: <b>in at the lower end, out at the upper end.</b> It stays separate from the distillate.', part:'condenser' },
  { name:'Collect', title:'One mixture.<br><em>Different fractions.</em>', text:'The distillate collects in the receiving flask. Early fractions are richer in the lower-boiling component. Later fractions can be collected as the mixture changes.', note:'<b>Enrichment is not guaranteed purity.</b> Some mixtures cannot be fully separated by this method.', part:'receiver' }
];
export const PARTS = {
  flask:{ number:'01', name:'Distillation flask', text:'Holds the liquid mixture. Gentle heating produces vapour containing both components.' },
  column:{ number:'02', name:'The fractionating column', text:'A larger surface area allows repeated condensation and vaporisation. This is where separation improves.' },
  thermometer:{ number:'03', name:'Thermometer', text:'The bulb sits at the side-arm entrance and measures the temperature of vapour entering the condenser.' },
  condenser:{ number:'04', name:'Liebig condenser', text:'A water jacket cools the inner tube. Cooling water and the distillate never mix.' },
  receiver:{ number:'05', name:'Receiving flask', text:'Collects the condensed vapour, called the distillate. Different portions can be collected as separate fractions.' },
  heater:{ number:'06', name:'Electric heating mantle', text:'Supplies heat to the mixture. An electric heat source avoids an open flame around flammable organic liquids.' },
  inlet:{ number:'07', name:'Cooling-water inlet', text:'Water enters at the lower end so the outer jacket fills completely and cools the vapour effectively.' },
  outlet:{ number:'08', name:'Cooling-water outlet', text:'Water leaves at the upper end. The cooling water remains inside the outer jacket.' }
};
export const PRODUCTS = [
  { name:'Petrol', color:'#cc9f3e', y:5.25, text:'A relatively light fraction, collected high in the cooler tower. Used as a motor fuel.' },
  { name:'Kerosene', color:'#ce7f45', y:4.15, text:'Kerosene condenses below lighter fractions. Uses include jet fuel and heating.' },
  { name:'Diesel', color:'#8e9a57', y:3.05, text:'Diesel is a heavier fraction collected lower in the tower, where temperatures are higher.' },
  { name:'Fuel oil', color:'#637d71', y:1.95, text:'Heavy fuel-oil fractions condense low in the tower. The heaviest residue remains at the bottom.' }
];
export const QUESTIONS = [
  { question:'What makes fractional distillation more effective than simple distillation?', options:['A much hotter flame','Repeated condensation and vaporisation','A filter that traps one liquid'], correct:1, explanation:'The fractionating column provides repeated condensation and vaporisation, progressively enriching the vapour in the more volatile component.', part:'column' },
  { question:'Which statement about the rising vapour is correct?', options:['Only the lower-boiling liquid can evaporate','It contains equal amounts of both liquids','Both can vaporise; the vapour is richer in the more volatile liquid'], correct:2, explanation:'Both components can enter the vapour. Their different tendencies to vaporise allow progressive enrichment.', part:'flask' },
  { question:'Where should cooling water enter the condenser?', options:['At the lower end of the water jacket','Through the inner vapour tube','At the upper end only'], correct:0, explanation:'Water enters at the lower end and leaves at the upper end, keeping the jacket filled. It does not mix with the distillate.', part:'inlet' }
];
export function initialState(){ return { step:0, elapsed:0, playing:false, complete:false }; }
export function advance(state, seconds){
  if (!state.playing || seconds <= 0 || !Number.isFinite(seconds)) return state;
  // Each stage loops for as long as the presenter needs. Only a click advances it.
  return { ...state, elapsed:state.elapsed+seconds };
}
export function selectStage(state, step){ return { ...state, step:Math.max(0,Math.min(STEPS.length-1,Math.trunc(step))), elapsed:0, playing:true, complete:false }; }
