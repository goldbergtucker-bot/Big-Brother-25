/*
 * BIG BROTHER 25 CUSTOM SIMULATOR — SEASON ENGINE
 *
 * Implements the BB Multiverse twist system:
 *   1. Premiere Nomination Competitions & HOH Save (Week 1): four groups of
 *      four run separate Multiverse-themed competitions; each loser is
 *      automatically nominated (four total), then the winner of a
 *      12-person HOH competition saves two of the four, leaving two on
 *      the block for a standard Veto/eviction cycle.
 *   2. The Seventeenth Houseguest: a 17th custom houseguest sits out the
 *      premiere entirely and joins safe from Week 1's nomination.
 *   3. The Nether Region (Weeks 2-6): the HOH runner-up sends a houseguest
 *      to safety each week; that houseguest can't play the week's Veto.
 *   4. BB Power of Invincibility (Week 4): a secret competition whose
 *      winner can reverse either of the next two evictions once, with the
 *      affected HOH allowed to compete again the following week.
 *   5. Humili-Week (Week 6): flavor-only reskin of that week's nomination
 *      ceremony.
 *   6. Scary Week Double Eviction & BB Zombies (Weeks 7-8): a double
 *      eviction where both evictees become Zombies and return for one
 *      week in limbo, then face off with no other competitions that week;
 *      the loser is out for good and the winner-week's outgoing HOH is
 *      allowed to compete again despite the normal sit-out rule.
 *   7. Classic Jury of Seven (from Week 7).
 *   8. BB Comic-Week (Week 11): the HOH plays in secret (and, matching
 *      real-season precedent, is allowed to compete again the following
 *      week), and a second, fully separate Veto competition runs the same
 *      week (Power of Multiplicity).
 *   9. A second, ordinary double eviction (Week 12).
 *  10. Standard weeks, jury, Final 3 three-part Final HOH and the finale.
 *
 * NOTE ON SIMPLIFICATIONS: the Nether Region's real weekly mechanic was a
 * rotating, multi-send cycle throughout the week; this engine applies one
 * send per week. BB Power of Invincibility always evaluates a save based
 * on the holder's bond with that evictee rather than genuine free choice.
 * A few competition descriptions are reconstructed from the competition's
 * name and Multiverse theme rather than a verified play-by-play (see
 * README). This engine implements the twists as fully playable custom-cast
 * mechanics rather than a frame-by-frame re-enactment of one season.
 */
(function(){
  const C=()=>window.Competitions;
  const R=()=>window.RelEngine;
  const CFG=()=>window.BB25_CONFIG;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const living=s=>s.houseguests.filter(h=>h.active);
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const pick=a=>a&&a.length?a[Math.floor(Math.random()*a.length)]:null;
  const hg=(s,id)=>s.houseguests.find(h=>h.id===id)||null;
  const displayName=h=>{const n=`${h?.firstName||""} ${h?.lastName||""}`.trim();return n||`Houseguest ${h?.slot||""}`;};
  const ordinal=n=>{const v=n%100;const suf=v>=11&&v<=13?"th":({1:"st",2:"nd",3:"rd"}[n%10]||"th");return `${n}${suf}`;};

  function snapshot(s){return {
    phase:s.phase,week:s.week,currentHOH:s.currentHOH,originalHOH:s.originalHOH||null,
    nominees:(s.nominees||[]).slice(),intendedTarget:s.intendedTarget||null,targetHistory:(s.targetHistory||[]).slice(),
    povPlayers:(s.povPlayers||[]).slice(),vetoWinners:(s.vetoWinners||[]).slice(),evictionVotes:(s.evictionVotes||[]).slice(),evicted:(s.evicted||[]).slice(),jury:(s.jury||[]).slice(),
    premiereGroups:JSON.parse(JSON.stringify(s.premiereGroups||[])),
    netherRegion:JSON.parse(JSON.stringify(s.netherRegion||{history:[]})),
    invincibility:s.invincibility?JSON.parse(JSON.stringify(s.invincibility)):null,
    zombies:s.zombies?JSON.parse(JSON.stringify(s.zombies)):null,
    comicWeek:s.comicWeek?JSON.parse(JSON.stringify(s.comicWeek)):null,
    houseguests:s.houseguests.map(h=>({id:h.id,slot:h.slot,firstName:h.firstName,lastName:h.lastName,portraitUrl:h.portraitUrl,gender:h.gender||"",active:h.active,safe:h.safe,nominated:h.nominated,juryMember:h.juryMember,evicted:h.evicted,placement:h.placement,zombie:!!h.zombie})),
    finale:s.finale?JSON.parse(JSON.stringify(s.finale)):null
  };}

  function eventData(s,e){
    const ids=a=>Array.isArray(a)?a.slice():[];
    const d={...(e.data||{})};
    d.competition=e.competition?JSON.parse(JSON.stringify(e.competition)):d.competition||null;
    d.participants=ids(e.participants||d.participants);d.nomineeIds=ids(e.nomineeIds||d.nomineeIds||s.nominees);d.povPlayers=ids(e.povPlayers||d.povPlayers||s.povPlayers);
    d.winnerId=e.winnerId||d.winnerId||null;d.hohId=e.hohId||d.hohId||s.currentHOH||null;d.evictedId=e.evictedId||d.evictedId||null;
    if(e.type==="veto-ceremony"){d.vetoUsed=!!(e.vetoUsed ?? d.vetoUsed);d.finalNomineeIds=ids(e.finalNomineeIds||d.finalNomineeIds||e.nomineeIds||d.nomineeIds||s.nominees);}
    if(e.type==="eviction-voting")d.votes=(s.evictionVotes||[]).map(v=>({...v})),d.voterIds=d.votes.map(v=>v.voterId);
    if(e.type==="eviction"){
      d.voteCounts={...(e.voteCounts||d.voteCounts||{})};
      d.tieBreakVoteId=e.tieBreakVoteId||d.tieBreakVoteId||null;
      d.evictedVoteCount=Number(e.evictedVoteCount ?? d.evictedVoteCount ?? 0);
      d.stayVoteCount=Number(e.stayVoteCount ?? d.stayVoteCount ?? 0);
    }
    if(["premiere-nomination","house-save","seventeenth-houseguest"].includes(e.type)) d.premiereGroups=JSON.parse(JSON.stringify(s.premiereGroups));
    if(e.type==="nether-region") d.netherRegion=JSON.parse(JSON.stringify(s.netherRegion));
    if(e.type==="invincibility"||e.type==="invincibility-save") d.invincibility=JSON.parse(JSON.stringify(s.invincibility||{}));
    if(e.type==="zombie-eviction"||e.type==="resurrection-rumble"||e.type==="do-or-die") d.zombies=JSON.parse(JSON.stringify(s.zombies||{}));
    if(e.type==="jury-vote")d.votes=(s._juryVotes||[]).map(v=>({...v})),d.voterIds=d.votes.map(v=>v.voterId),d.finalistIds=living(s).map(h=>h.id);
    if(e.type==="final-decision")d.finalistIds=living(s).map(h=>h.id);
    if(e.type==="winner"){d.runnerUpId=e.runnerUpId||d.runnerUpId||s.finale?.runnerUpId||null;d.afpId=e.afpId||d.afpId||s.finale?.americasFavoriteId||null;d.afpVotes=e.afpVotes||d.afpVotes||s.finale?.americasFavoriteVotes||{};d.thirdPlaceId=e.thirdPlaceId||d.thirdPlaceId||s.finale?.thirdPlaceId||null;}
    return d;
  }
  function log(s,e){const r={id:s.history.length+1,...e};r.snapshot=snapshot(s);r.data=eventData(s,r);s.history.push(r);}

  function ensureState(s){
    s.evicted=Array.isArray(s.evicted)?s.evicted:[];s.jury=Array.isArray(s.jury)?s.jury:[];
    s.nominees=s.nominees||[];s.povPlayers=s.povPlayers||[];s.vetoWinners=s.vetoWinners||[];s.evictionVotes=s.evictionVotes||[];
    s.teams=Array.isArray(s.teams)?s.teams:[];s.history=s.history||[];
    s.premiereGroups=Array.isArray(s.premiereGroups)?s.premiereGroups:[];
    s.netherRegion=s.netherRegion&&typeof s.netherRegion==="object"?s.netherRegion:{history:[]};
    s.invincibility=s.invincibility||null;s.zombies=s.zombies||null;s.comicWeek=s.comicWeek||null;
    s.houseguests.forEach(h=>{h.gender=h.gender||"";h.allianceIds=h.allianceIds||[];h.ratings=h.ratings||{general:50,physical:50,mental:50,social:50,strategic:50};});
  }

  function relationshipScore(s,a,b){const r=s.relationships?.[a.id]?.[b.id]||{friendship:50,trust:50,loyalty:50,respect:50,attraction:0,rivalry:0};return (r.friendship||0)*.30+(r.trust||0)*.25+(r.loyalty||0)*.15+(r.respect||0)*.20+(r.attraction||0)*.10-(r.rivalry||0)*.35;}
  function randomizeRelationships(s){if(s.season.relationshipsRandomized||s.season.relationshipsCustomized)return;s.houseguests.forEach(a=>s.houseguests.forEach(b=>{if(a.id===b.id)return;const r=s.relationships[a.id][b.id];const n=()=>Math.round(Math.random()*40-20);r.friendship=clamp(r.friendship+n(),15,85);r.trust=clamp(r.trust+n(),15,85);r.loyalty=clamp(r.loyalty+n(),15,85);r.respect=clamp(r.respect+n(),15,85);r.rivalry=Math.round(Math.random()*25);r.attraction=Math.round(Math.random()*30);}));s.season.relationshipsRandomized=true;}

  /* ---------------------------- NOMINATIONS / POV (shared) ---------------------------- */
  function planTarget(s,hoh,noms){
    const ranked=noms.map(p=>({p,score:relationshipScore(s,hoh,p)})).sort((a,b)=>a.score-b.score);
    const target=ranked[0]?.p;
    return {text:target?displayName(target):null};
  }
  function chooseNominees(s,hoh,pool){
    const candidates=pool.filter(p=>p.id!==hoh.id&&!p.safe);
    let noms;
    if(R()?.pickNominees){try{noms=R().pickNominees(s,hoh,candidates,Math.min(2,candidates.length));}catch(e){noms=shuffle(candidates).slice(0,2);}}
    else noms=shuffle(candidates).slice(0,2);
    if(noms.length<2){
      const extra=(pool.length?pool:living(s)).filter(p=>p.id!==hoh.id&&!noms.some(n=>n.id===p.id));
      if(extra.length)noms.push(pick(extra));
    }
    return noms;
  }
  function logNominations(s,week,hoh,noms,title){
    noms.forEach(n=>n.nominated=true);
    s.nominees=noms.map(n=>n.id);
    const plan=planTarget(s,hoh,noms);
    s.intendedTarget=plan.text;s.targetHistory=[{text:plan.text,reason:"Initial target"}];
    log(s,{week,phase:s.phase,type:"nominations",hohId:hoh.id,nomineeIds:s.nominees,intendedTarget:s.intendedTarget,targetHistory:s.targetHistory,title:title||"Nomination Ceremony",lines:[`${displayName(hoh)} nominates ${noms.map(displayName).join(" and ")} for eviction.`]});
  }
  function selectPOVPlayers(s,week,pool,type){
    const noms=s.nominees.map(id=>hg(s,id)).filter(Boolean),hoh=hg(s,s.currentHOH);
    const base=pool||living(s);
    const remaining=shuffle(base.filter(p=>!noms.some(n=>n.id===p.id)&&p.id!==hoh.id));
    const players=[hoh,...noms,...remaining.slice(0,Math.max(0,6-1-noms.length))];
    s.povPlayers=players.map(p=>p.id);
    log(s,{week,phase:s.phase,type:"pov-players",hohId:hoh.id,nomineeIds:s.nominees,povPlayers:s.povPlayers,participants:s.povPlayers,title:"POV Picked Players",lines:[`${displayName(hoh)} and the nominees are automatically selected; the remaining slots are randomly drawn.`]});
    return players;
  }
  function runPOVCompetition(s,week,pool,type){
    const comp=C().runCompetition(pool,{week,type:type||"pov"}),winner=comp.winner;s.vetoWinners=[winner.id];
    log(s,{week,phase:s.phase,type:"veto",winnerId:winner.id,participants:pool.map(p=>p.id),competition:comp,title:`Power of Veto — ${comp.label}`,lines:[`${displayName(winner)} wins the Power of Veto.`]});
    return {pool,winner};
  }
  function applyVeto(s,week,veto,eligiblePool){
    let noms=s.nominees.map(id=>hg(s,id)).filter(Boolean);
    const hoh=hg(s,s.currentHOH),winner=veto.winner;
    const decision=R().decideVetoUse(s,winner,hoh,noms);
    if(!decision.use){
      log(s,{week,phase:s.phase,type:"veto-ceremony",hohId:hoh.id,winnerId:winner.id,nomineeIds:s.nominees,finalNomineeIds:s.nominees,vetoUsed:false,title:"Veto Ceremony — Not Used",lines:[`${displayName(winner)} does not use the Power of Veto.`]});
      return;
    }
    const saved=noms.find(n=>n.id===decision.saveId)||noms[0];
    saved.nominated=false;
    const base=eligiblePool||living(s);
    const pool=base.filter(p=>p.id!==hoh.id&&!p.safe&&!noms.some(n=>n.id===p.id)&&p.id!==saved.id&&p.id!==winner.id);
    const replacement=R().pickReplacement?R().pickReplacement(s,hoh,pool,noms.map(n=>n.id)):pick(pool);
    let finalNoms=noms.filter(n=>n.id!==saved.id);
    if(replacement){replacement.nominated=true;finalNoms.push(replacement);}
    s.nominees=finalNoms.map(n=>n.id);
    log(s,{week,phase:s.phase,type:"veto-ceremony",hohId:hoh.id,winnerId:winner.id,nomineeIds:s.nominees,finalNomineeIds:s.nominees,vetoUsed:true,title:"Veto Ceremony — Used",lines:[`${displayName(winner)} uses the Power of Veto on ${displayName(saved)}${replacement?`; ${displayName(hoh)} names ${displayName(replacement)} as the replacement nominee.`:"."}`]});
  }
  function runVetoCycle(s,week,pool,type){
    const povPool=selectPOVPlayers(s,week,pool,type);
    const veto=runPOVCompetition(s,week,povPool,type);
    applyVeto(s,week,veto,pool);
  }

  function evictionCycle(s,week,voterPool=null){
    let noms=s.nominees.map(id=>hg(s,id)).filter(Boolean);
    if(!noms.length)return null;
    const hoh=hg(s,s.currentHOH);
    const nomineeIds=new Set(noms.map(n=>n.id));
    const basePool=voterPool||living(s);
    const voters=basePool.filter(p=>p.id!==hoh.id&&!nomineeIds.has(p.id));
    const counts={};noms.forEach(n=>counts[n.id]=0);
    s.evictionVotes=[];
    voters.forEach(v=>{
      let out=R().decideVote(s,v,noms[0],noms[1]||noms[0],hoh);
      if(!(out in counts))out=noms[0].id;
      counts[out]++;s.evictionVotes.push({voterId:v.id,targetId:out});
    });
    const maxVotes=Math.max(...Object.values(counts));
    const topIds=Object.keys(counts).filter(id=>counts[id]===maxVotes);
    let evictedId,tieBreakVoteId=null;
    if(topIds.length>1||voters.length===0){
      const tied=topIds.length>1?topIds.map(id=>hg(s,id)):noms;
      const scored=tied.map(p=>({p,score:relationshipScore(s,hoh,p)+Math.random()*6-3})).sort((a,b)=>a.score-b.score);
      evictedId=scored[0].p.id;tieBreakVoteId=evictedId;
    }else{
      evictedId=topIds[0];
    }
    const evicted=hg(s,evictedId);
    const others=noms.filter(n=>n.id!==evictedId);
    log(s,{week,phase:s.phase,type:"eviction-voting",nomineeIds:noms.map(n=>n.id),voterIds:voters.map(v=>v.id),votes:s.evictionVotes,tieBreakVoteId,title:"Eviction Vote",lines:[...s.evictionVotes.map(v=>`${displayName(hg(s,v.voterId))} votes to evict ${displayName(hg(s,v.targetId))}.`),...(tieBreakVoteId?[`${displayName(hoh)} breaks the tie and votes to evict ${displayName(hg(s,tieBreakVoteId))}.`]:[])]});
    evicted.active=false;evicted.evicted=true;s.season.evictionCount++;evicted.placement=s.season.castSize-s.season.evictionCount+1;
    const juryThreshold=CFG().juryThresholdPlacement||9;
    if(evicted.placement<=juryThreshold&&!s.jury.includes(evicted.id)){evicted.juryMember=true;s.jury.push(evicted.id);evicted.juryOrder=s.jury.length;}
    s.evicted.push(evicted.id);
    s._departureOrder.push(evicted.id);
    const evictedVoteCount=counts[evictedId];
    const stayVoteCount=others.length===1?counts[others[0].id]:0;
    log(s,{week,phase:s.phase,type:"eviction",evictedId:evicted.id,voteCounts:counts,evictedVoteCount,stayVoteCount,tieBreakVoteId,nomineeIds:noms.map(n=>n.id),title:"Eviction",lines:[`By a vote of ${counts[evictedId]} to ${others.length===1?counts[others[0].id]:0}, ${displayName(evicted)}, you have been evicted.`,...(tieBreakVoteId?[`${displayName(hoh)} broke the tie and voted to evict ${displayName(evicted)}.`]:[]),evicted.juryMember?`${displayName(evicted)} joins the jury.`:`${displayName(evicted)} finishes in ${ordinal(evicted.placement)} place.`]});
    s.nominees=[];s.povPlayers=[];s.vetoWinners=[];s.evictionVotes=[];
    return evicted;
  }

  function undoEviction(evicted,s){
    evicted.active=true;evicted.evicted=false;evicted.juryMember=false;evicted.placement=null;evicted.zombie=false;
    s._departureOrder=s._departureOrder.filter(id=>id!==evicted.id);
    s.evicted=s.evicted.filter(id=>id!==evicted.id);
    s.jury=s.jury.filter(id=>id!==evicted.id);
    s.season.evictionCount--;
  }

  /* ------------------------------- PREMIERE (WEEK 1) ------------------------------- */
  function runPremiereWeek(s){
    s.week=1;s.phase="premiere";
    randomizeRelationships(s);
    s.houseguests.forEach(h=>{h.active=true;h.safe=false;h.nominated=false;});
    const all=shuffle(living(s));
    const seventeenth=all[all.length-1];
    seventeenth.safe=true;
    const sixteen=all.slice(0,16);
    const groups=[0,1,2,3].map(i=>sixteen.slice(i*4,i*4+4));
    const universeTypes=["premiere-nom-scramble","premiere-nom-humili","premiere-nom-comic","premiere-nom-scary"];
    const universeNames=["Scramble-verse","Humili-verse","Comic-verse","Scary-verse"];
    s.premiereGroups=groups.map((g,i)=>({id:`group-${i+1}`,universe:universeNames[i],memberIds:g.map(p=>p.id)}));
    const preNominees=[];
    groups.forEach((group,i)=>{
      const comp=C().runCompetition(group,{week:1,type:universeTypes[i]});
      const loser=[...comp.ranking].sort((a,b)=>a.score-b.score)[0];
      const loserHg=hg(s,loser.id);
      loserHg.nominated=true;
      preNominees.push(loserHg);
      log(s,{week:1,phase:"premiere",type:"premiere-nomination",winnerId:comp.winner.id,evictedId:loserHg.id,participants:group.map(p=>p.id),competition:comp,title:`${universeNames[i]} Nomination Competition — ${comp.label}`,lines:[`${displayName(comp.winner)} wins the ${universeNames[i]} qualifier.`,`${displayName(loserHg)} finishes last and is automatically nominated for eviction — before an HOH is even crowned.`]});
    });
    const hohPool=sixteen.filter(p=>!preNominees.some(n=>n.id===p.id));
    const comp=C().runCompetition(hohPool,{week:1,type:"hoh"});
    const hoh=comp.winner;
    s.currentHOH=hoh.id;s._priorHohIds=[hoh.id];
    log(s,{week:1,phase:"premiere",type:"hoh",winnerId:hoh.id,participants:hohPool.map(p=>p.id),competition:comp,title:`Head of Household — ${comp.label}`,lines:[`${displayName(hoh)} wins the Week 1 HOH and must decide which two of the four premiere nominees to save.`]});
    const scored=preNominees.map(p=>({p,score:relationshipScore(s,hoh,p)+Math.random()*15})).sort((a,b)=>b.score-a.score);
    const saved=scored.slice(0,2).map(x=>x.p);
    const remain=scored.slice(2).map(x=>x.p);
    saved.forEach(p=>p.nominated=false);
    log(s,{week:1,phase:"premiere",type:"house-save",hohId:hoh.id,winnerId:hoh.id,participants:preNominees.map(p=>p.id),title:"HOH Save",lines:[`${displayName(hoh)} saves ${saved.map(displayName).join(" and ")} from the block.`,`${remain.map(displayName).join(" and ")} remain nominated for eviction.`]});
    s.nominees=remain.map(p=>p.id);
    const plan=planTarget(s,hoh,remain);
    s.intendedTarget=plan.text;s.targetHistory=[{text:plan.text,reason:"Initial target"}];
    runVetoCycle(s,1,hohPool.concat(remain),"pov");
    evictionCycle(s,1,hohPool);
    seventeenth.safe=false;
    log(s,{week:1,phase:"premiere",type:"seventeenth-houseguest",winnerId:seventeenth.id,participants:[seventeenth.id],title:"The Seventeenth Houseguest",lines:[`A surprise seventeenth houseguest, ${displayName(seventeenth)}, joins the game after sitting out the premiere competitions — safe from this week's nomination, but eligible for everything from here on.`]});
  }

  /* ------------------------------- NETHER REGION ------------------------------- */
  function runNetherRegion(s,week,hohComp,hoh){
    const ranking=[...(hohComp.ranking||[])].sort((a,b)=>b.score-a.score);
    const runnerUpEntry=ranking.find(r=>r.id!==hoh.id);
    if(!runnerUpEntry)return;
    const runnerUp=hg(s,runnerUpEntry.id);
    if(!runnerUp||!runnerUp.active)return;
    const pool=living(s).filter(p=>p.id!==hoh.id&&p.id!==runnerUp.id);
    if(!pool.length)return;
    const scored=pool.map(p=>({p,score:relationshipScore(s,runnerUp,p)+Math.random()*15})).sort((a,b)=>b.score-a.score);
    const sent=scored[0].p;
    sent.safe=true;
    sent.netherRegionIneligiblePOV=true;
    s.netherRegion.history.push({week,senderId:runnerUp.id,sentId:sent.id});
    log(s,{week,phase:s.phase,type:"nether-region",winnerId:sent.id,hohId:hoh.id,participants:[runnerUp.id,sent.id],title:"The Nether Region",lines:[`As runner-up in this week's HOH, ${displayName(runnerUp)} must send a houseguest to the Nether Region.`,`${displayName(sent)} is sent to the Nether Region — safe from nomination this week, but ineligible to play in the Veto.`]});
  }

  /* --------------------------------- STANDARD WEEK --------------------------------- */
  function buildHohPool(s){
    const excluded=new Set(s._priorHohIds||[]);
    let pool=living(s).filter(p=>!excluded.has(p.id));
    if(pool.length<2)pool=living(s);
    return pool;
  }
  function runStandardWeek(s,week){
    s.week=week;s.phase="standard";
    s.houseguests.forEach(h=>{h.safe=false;h.nominated=false;h.netherRegionIneligiblePOV=false;});
    const pool=buildHohPool(s);
    const comp=C().runCompetition(pool,{week,type:"hoh"});
    const hoh=comp.winner;
    s.currentHOH=hoh.id;s._priorHohIds=[hoh.id];
    log(s,{week,phase:"standard",type:"hoh",winnerId:hoh.id,participants:pool.map(p=>p.id),competition:comp,title:`Head of Household — ${comp.label}`,lines:[`${displayName(hoh)} wins HOH.`]});
    if(CFG().netherRegionWeeks.includes(week))runNetherRegion(s,week,comp,hoh);
    const noms=chooseNominees(s,hoh,living(s));
    logNominations(s,week,hoh,noms,week===6?"Nomination Ceremony — Pie in the Face":"Nomination Ceremony");
    let povPool=living(s).filter(p=>!p.netherRegionIneligiblePOV||p.id===hoh.id||s.nominees.includes(p.id));
    runVetoCycle(s,week,povPool,"pov");
    const evictee=evictionCycle(s,week);
    if(week===CFG().invincibilityWeek){
      runInvincibilityComp(s,week);
      maybeUseInvincibility(s,week,evictee);
    }else if(s.invincibility&&!s.invincibility.used&&s.invincibility.chancesLeft>0){
      maybeUseInvincibility(s,week,evictee);
    }
    return evictee;
  }

  /* ------------------------------ POWER OF INVINCIBILITY ------------------------------ */
  function runInvincibilityComp(s,week){
    const hoh=hg(s,s.currentHOH);
    const pool=shuffle(living(s).filter(p=>p.id!==hoh.id)).slice(0,4);
    if(pool.length<2)return;
    const comp=C().runCompetition(pool,{week,type:"invincibility"});
    const winner=comp.winner;
    s.invincibility={holderId:winner.id,used:false,chancesLeft:2,savedId:null};
    log(s,{week,phase:s.phase,type:"invincibility",winnerId:winner.id,participants:pool.map(p=>p.id),competition:comp,title:`BB Power of Invincibility — ${comp.label}`,lines:[`Four fan-chosen houseguests secretly compete for the BB Power of Invincibility.`,`${displayName(winner)} wins the power and can use it to bring back one of the next two evictees — including themselves.`]});
  }
  function maybeUseInvincibility(s,week,evictee){
    const inv=s.invincibility;
    if(!inv||inv.used||inv.chancesLeft<=0||!evictee)return false;
    inv.chancesLeft--;
    const holder=hg(s,inv.holderId);
    if(!holder)return false;
    const isSelf=evictee.id===holder.id;
    const bond=isSelf?100:relationshipScore(s,holder,evictee);
    const willUse=holder.active&&(isSelf?Math.random()<0.65:bond>46);
    if(!willUse){
      if(inv.chancesLeft<=0){
        log(s,{week,phase:s.phase,type:"invincibility",winnerId:holder.id,participants:[holder.id],title:"BB Power of Invincibility — Expires",lines:[`${displayName(holder)} lets the BB Power of Invincibility expire without using it.`]});
      }
      return false;
    }
    inv.used=true;inv.savedId=evictee.id;
    const outgoingHohId=s.currentHOH;
    undoEviction(evictee,s);
    s._priorHohIds=[];
    log(s,{week,phase:s.phase,type:"invincibility-save",winnerId:holder.id,evictedId:evictee.id,participants:[holder.id,evictee.id],title:"BB Power of Invincibility — Used",lines:[`${displayName(holder)} uses the BB Power of Invincibility to immediately bring ${isSelf?"themselves":displayName(evictee)} back into the game.`,`Because both of this week's nominees are staying in the house, ${displayName(hg(s,outgoingHohId))} is allowed to compete in the next HOH despite normally sitting out.`]});
    return true;
  }

  /* --------------------------- SCARY WEEK DOUBLE EVICTION & ZOMBIES --------------------------- */
  function runZombieDoubleEviction(s,week){
    s.week=week;s.phase="double-eviction";
    s.houseguests.forEach(h=>{h.safe=false;h.nominated=false;h.netherRegionIneligiblePOV=false;});
    const pool1=buildHohPool(s);
    const comp1=C().runCompetition(pool1,{week,type:"hoh"});
    const hoh1=comp1.winner;
    s.currentHOH=hoh1.id;
    log(s,{week,phase:"double-eviction",type:"hoh",winnerId:hoh1.id,participants:pool1.map(p=>p.id),competition:comp1,title:`Head of Household — ${comp1.label}`,lines:[`${displayName(hoh1)} wins the first HOH of the Scary Week Double Eviction.`]});
    const noms1=chooseNominees(s,hoh1,living(s));
    logNominations(s,week,hoh1,noms1);
    runVetoCycle(s,week,living(s),"pov");
    const evictee1=evictionCycle(s,week);
    if(evictee1){evictee1.zombie=true;}

    const pool2=living(s).filter(p=>p.id!==hoh1.id);
    const comp2=C().runCompetition(pool2,{week,type:"hoh-round2"});
    const hoh2=comp2.winner;
    s.currentHOH=hoh2.id;
    log(s,{week,phase:"double-eviction",type:"hoh-round2",winnerId:hoh2.id,participants:pool2.map(p=>p.id),competition:comp2,title:`Head of Household (Round 2) — ${comp2.label}`,lines:[`${displayName(hoh2)} wins the second HOH of the Scary Week Double Eviction.`]});
    const noms2=chooseNominees(s,hoh2,living(s));
    logNominations(s,week,hoh2,noms2);
    runVetoCycle(s,week,living(s),"pov-round2");
    const evictee2=evictionCycle(s,week);
    if(evictee2){evictee2.zombie=true;}

    s.zombies={week,zombieIds:[evictee1?.id,evictee2?.id].filter(Boolean),advantageWinnerId:null,returnedId:null,eliminatedId:null};
    s._priorHohIds=[hoh2.id];
    log(s,{week,phase:"double-eviction",type:"zombie-eviction",participants:s.zombies.zombieIds,title:"Big Brother Zombies",lines:[`${(s.zombies.zombieIds.map(id=>displayName(hg(s,id)))).join(" and ")} both become Big Brother Zombies rather than leaving for good — they'll move back into the house tonight.`,`There will be no HOH or Veto competition next week. Instead, the two Zombies will face off for the right to fully return to the game.`]});
  }
  function runZombieResolutionWeek(s,week){
    s.week=week;s.phase="zombie-resolution";
    const zombies=(s.zombies?.zombieIds||[]).map(id=>hg(s,id)).filter(Boolean);
    if(zombies.length<2){
      // Safety net: if for some reason only one zombie exists, they simply return.
      if(zombies.length===1){undoEviction(zombies[0],s);s.zombies.returnedId=zombies[0].id;}
      s._priorHohIds=[];
      return;
    }
    const rumble=C().runCompetition(zombies,{week,type:"resurrection-rumble"});
    const advantageWinner=rumble.winner;
    s.zombies.advantageWinnerId=advantageWinner.id;
    log(s,{week,phase:"zombie-resolution",type:"resurrection-rumble",winnerId:advantageWinner.id,participants:zombies.map(p=>p.id),competition:rumble,title:`Resurrection Rumble — ${rumble.label}`,lines:[`With no HOH or Veto this week, the two Zombies compete for a game advantage.`,`${displayName(advantageWinner)} wins the advantage heading into the final showdown.`]});
    const doOrDie=C().runCompetition(zombies,{week,type:"do-or-die",advantageId:advantageWinner.id});
    const winner=doOrDie.winner;
    const loser=zombies.find(p=>p.id!==winner.id);
    s.zombies.returnedId=winner.id;s.zombies.eliminatedId=loser.id;
    undoEviction(winner,s);
    loser.zombie=false;
    log(s,{week,phase:"zombie-resolution",type:"do-or-die",winnerId:winner.id,evictedId:loser.id,participants:zombies.map(p=>p.id),competition:doOrDie,title:`Do or Die — ${doOrDie.label}`,lines:[`${displayName(winner)} wins and returns to the game as if never evicted.`,`${displayName(loser)} is out of the house for good.`,`Because there were no competitions this week, the outgoing HOH is allowed to compete again next week.`]});
    s._priorHohIds=[];
  }

  /* --------------------------- ORDINARY DOUBLE EVICTION (WEEK 12) --------------------------- */
  function runOrdinaryDoubleEviction(s,week){
    s.week=week;s.phase="double-eviction";
    s.houseguests.forEach(h=>{h.safe=false;h.nominated=false;h.netherRegionIneligiblePOV=false;});
    const pool1=buildHohPool(s);
    const comp1=C().runCompetition(pool1,{week,type:"hoh"});
    const hoh1=comp1.winner;
    s.currentHOH=hoh1.id;
    log(s,{week,phase:"double-eviction",type:"hoh",winnerId:hoh1.id,participants:pool1.map(p=>p.id),competition:comp1,title:`Head of Household — ${comp1.label}`,lines:[`${displayName(hoh1)} wins the first HOH of tonight's Double Eviction.`]});
    const noms1=chooseNominees(s,hoh1,living(s));
    logNominations(s,week,hoh1,noms1);
    runVetoCycle(s,week,living(s),"pov");
    evictionCycle(s,week);

    const pool2=living(s).filter(p=>p.id!==hoh1.id);
    const comp2=C().runCompetition(pool2,{week,type:"hoh-round2"});
    const hoh2=comp2.winner;
    s.currentHOH=hoh2.id;
    log(s,{week,phase:"double-eviction",type:"hoh-round2",winnerId:hoh2.id,participants:pool2.map(p=>p.id),competition:comp2,title:`Head of Household (Round 2) — ${comp2.label}`,lines:[`${displayName(hoh2)} wins the second HOH of tonight's Double Eviction.`]});
    const noms2=chooseNominees(s,hoh2,living(s));
    logNominations(s,week,hoh2,noms2);
    runVetoCycle(s,week,living(s),"pov-round2");
    evictionCycle(s,week);
    s._priorHohIds=[hoh2.id];
  }

  /* --------------------------------- BB COMIC-WEEK --------------------------------- */
  function runComicWeek(s,week){
    s.week=week;s.phase="standard";
    s.houseguests.forEach(h=>{h.safe=false;h.nominated=false;h.netherRegionIneligiblePOV=false;});
    const pool=buildHohPool(s);
    const comp=C().runCompetition(pool,{week,type:"hoh"});
    const hoh=comp.winner;
    s.currentHOH=hoh.id;
    s.comicWeek={week,invisibleHohId:hoh.id};
    log(s,{week,phase:"standard",type:"hoh",winnerId:hoh.id,participants:pool.map(p=>p.id),competition:comp,title:`Head of Household — ${comp.label}`,lines:[`${displayName(hoh)} wins HOH — and, under the Power of Invisibility, will operate in total secret for the rest of the week.`]});
    const noms=chooseNominees(s,hoh,living(s));
    logNominations(s,week,hoh,noms);
    runVetoCycle(s,week,living(s),"pov");
    log(s,{week,phase:s.phase,type:"invincibility",winnerId:hoh.id,participants:[hoh.id],title:"Power of Multiplicity",lines:[`The Power of Multiplicity puts a second, fully separate Power of Veto up for grabs this week.`]});
    runVetoCycle(s,week,living(s),"pov-multiplicity");
    const evictee=evictionCycle(s,week);
    s._priorHohIds=[];
    log(s,{week,phase:s.phase,type:"invincibility",winnerId:hoh.id,participants:[hoh.id],title:"Power of Invisibility — Precedent",lines:[`Because this week's HOH operated in secret, ${displayName(hoh)} is allowed to compete in next week's HOH despite normally sitting out.`]});
    return evictee;
  }

  /* ----------------------------------- FINALE ---------------------------------- */
  function runFinale(s){s.week="Final";s.phase="finale";const three=living(s);if(three.length!==3)return;const p1=C().runCompetition(three,{week:14,type:"final-hoh-1"});log(s,{week:"Final",phase:"finale",type:"final3-part1",winnerId:p1.winner.id,participants:three.map(p=>p.id),competition:p1,title:`Final HOH Part 1 — ${p1.label}`,lines:[`${displayName(p1.winner)} wins Part 1 and advances directly to Part 3.`]});const rem=three.filter(p=>p.id!==p1.winner.id);const p2=C().runCompetition(rem,{week:14,type:"final-hoh-2"});log(s,{week:"Final",phase:"finale",type:"final3-part2",winnerId:p2.winner.id,participants:rem.map(p=>p.id),competition:p2,title:`Final HOH Part 2 — ${p2.label}`,lines:[`${displayName(p2.winner)} wins Part 2 and advances to Part 3.`]});const p3=C().runCompetition([p1.winner,p2.winner],{week:14,type:"final-hoh-3"});const finalHoh=p3.winner;const other=three.filter(p=>p.id!==finalHoh.id);const chosen=R().decideFinalTwoPick(s,finalHoh,other);const third=other.find(p=>p.id!==chosen.id);log(s,{week:"Final",phase:"finale",type:"final3-part3",winnerId:finalHoh.id,participants:[p1.winner.id,p2.winner.id],competition:p3,title:`Final HOH Part 3 — ${p3.label}`,lines:[`${displayName(finalHoh)} wins Part 3 and becomes the final HOH.`]});third.active=false;third.evicted=true;third.placement=3;third.juryMember=true;if(!s.jury.includes(third.id))s.jury.push(third.id);s.evicted.push(third.id);s.currentHOH=finalHoh.id;log(s,{week:"Final",phase:"finale",type:"final-decision",hohId:finalHoh.id,thirdPlaceId:third.id,finalistIds:[finalHoh.id,chosen.id],title:"Final HOH's Decision",lines:[`${displayName(finalHoh)} takes ${displayName(chosen)} to the Final 2 and evicts ${displayName(third)}.`,`${displayName(third)} finishes in 3rd place and joins the jury.`]});const finalists=[finalHoh,chosen],jurors=s.jury.map(id=>hg(s,id)).filter(Boolean),tally={[finalists[0].id]:0,[finalists[1].id]:0};s._juryVotes=[];jurors.forEach(j=>{const vote=R().decideJuryVote(s,j,finalists[0],finalists[1]);tally[vote]++;s._juryVotes.push({voterId:j.id,targetId:vote});});log(s,{week:"Final",phase:"finale",type:"jury-vote",votes:s._juryVotes,finalistIds:finalists.map(p=>p.id),title:"The Jury Votes",lines:s._juryVotes.map(v=>`${displayName(hg(s,v.voterId))} votes for ${displayName(hg(s,v.targetId))}.`)});const winnerId=tally[finalists[0].id]>=tally[finalists[1].id]?finalists[0].id:finalists[1].id;const runnerId=winnerId===finalists[0].id?finalists[1].id:finalists[0].id;hg(s,winnerId).placement=1;hg(s,runnerId).placement=2;hg(s,winnerId).active=false;hg(s,runnerId).active=false;
    const afpCandidates=s.houseguests.slice();
    const afpScores=afpCandidates.map(h=>{const others=afpCandidates.filter(x=>x.id!==h.id);const social=Number(h.ratings?.social||50),general=Number(h.ratings?.general||50);const avgRel=others.length?others.reduce((sum,o)=>sum+relationshipScore(s,h,o),0)/others.length:50;return {id:h.id,score:social*.45+general*.20+avgRel*.20+Math.random()*15};}).sort((a,b)=>b.score-a.score);
    const afpId=afpScores[0]?.id||winnerId;const raw={};afpScores.forEach(x=>raw[x.id]=Math.max(.5,x.score));const total=Object.values(raw).reduce((a,b)=>a+b,0)||1;const afpVotes={};Object.keys(raw).forEach(id=>afpVotes[id]=Math.max(1,Math.round(raw[id]/total*100000)));const voteTotal=Object.values(afpVotes).reduce((a,b)=>a+b,0);afpVotes[afpId]+=(100000-voteTotal);
    s.finale={winnerId,runnerUpId:runnerId,thirdPlaceId:third.id,finalHohId:finalHoh.id,votes:tally,jurySize:jurors.length,prize:750000,runnerUpPrize:75000,americasFavoritePrize:25000,americasFavoriteId:afpId,americasFavoriteVotes:afpVotes};s.phase="complete";log(s,{week:"Final",phase:"finale",type:"winner",winnerId,runnerUpId:runnerId,thirdPlaceId:third.id,finalistIds:[winnerId,runnerId],afpId,afpVotes,title:`${displayName(hg(s,winnerId))} Wins Big Brother!`,lines:[`By a vote of ${tally[winnerId]}-${tally[runnerId]}, ${displayName(hg(s,winnerId))} wins Big Brother.`,`${displayName(hg(s,runnerId))} finishes as the Runner-Up and receives $75,000.`,`America's Favorite Player: ${displayName(hg(s,afpId))} wins $25,000.`]});}

  function simulateSeason(s,config){
    ensureState(s);
    s.history=[];s.jury=[];s.evicted=[];s.evictionVotes=[];s.nominees=[];s.povPlayers=[];s.vetoWinners=[];
    s.currentHOH=null;s.originalHOH=null;s.finale=null;s._priorHohIds=[];
    s.premiereGroups=[];s.netherRegion={history:[]};s.invincibility=null;s.zombies=null;s.comicWeek=null;
    s._departureOrder=[];
    s.season.evictionCount=0;s.season.castSize=s.houseguests.length;s.teams=[];
    s.houseguests.forEach(h=>{h.active=true;h.safe=false;h.nominated=false;h.juryMember=false;h.evicted=false;h.placement=null;h.juryOrder=0;h.zombie=false;h.netherRegionIneligiblePOV=false;});
    runPremiereWeek(s);
    let week=2,guard=0;
    while(living(s).length>3&&week<=40&&guard<50){
      if(week===CFG().zombieWeek&&living(s).length>=6){
        runZombieDoubleEviction(s,week);
      }else if(week===CFG().zombieResolutionWeek){
        runZombieResolutionWeek(s,week);
      }else if(week===CFG().comicWeekWeek){
        runComicWeek(s,week);
      }else if(week===CFG().secondDoubleEvictionWeek&&living(s).length>=6){
        runOrdinaryDoubleEviction(s,week);
      }else{
        runStandardWeek(s,week);
      }
      week++;guard++;
    }
    runFinale(s);
    s._departureOrder.forEach((id,i)=>{const h=hg(s,id);if(h)h.placement=s.season.castSize-i;});
    if(window.LiveFeeds?.addToSeason)window.LiveFeeds.addToSeason(s);
    return s;
  }
  window.SeasonEngine={simulateSeason,displayName,ordinal};
})();
