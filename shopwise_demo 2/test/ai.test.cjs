const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyAccess,validateInput,generateReply}=require('../lib/ai.cjs');

test('Access code validation',()=>{
  assert.equal(verifyAccess(undefined,undefined),true);
  assert.equal(verifyAccess('supersecret','supersecret'),true);
  assert.equal(verifyAccess('supersecret','nope'),false);
});
test('Reject empty message and invalid input',()=>{
  assert.throws(()=>validateInput({message:''}),/Message must/);
  assert.throws(()=>validateInput(null),/format/);
});
test('General question answered with history, while keeping demo context labelled',async()=>{
  let outbound;
  const fakeFetch=async(url,options)=>{
    assert.equal(url,'https://api.openai.com/v1/responses');
    outbound=JSON.parse(options.body);
    return {ok:true,json:async()=>({output:[{content:[{type:'output_text',text:'7'}]}]})};
  };
  const answer=await generateReply({message:'What is 3+4?',history:[{role:'user',text:'Help with math'}],context:{selectedProduct:'oats',offers:[{store:'FairPrice',estimatedTotal:5.95}]}},{OPENAI_API_KEY:'test-key',OPENAI_MODEL:'gpt-4.1-mini'},fakeFetch);
  assert.equal(answer,'7');
  assert.equal(outbound.input.at(-1).content,'What is 3+4?');
  assert.equal(outbound.input[1].content,'Help with math');
  assert.equal(outbound.store,false);
  assert.match(outbound.input[0].content,/FICTIONAL/);
});
test('Missing API key returns user-readable configuration error',async()=>{
  await assert.rejects(generateReply({message:'Hello'},{},()=>{}),/AI is not connected yet/);
});
test('Upstream rate limit returns friendly error without exposing keys',async()=>{
  await assert.rejects(generateReply({message:'Hello'},{OPENAI_API_KEY:'x'},async()=>({ok:false,status:429})),/usage limit/);
});
