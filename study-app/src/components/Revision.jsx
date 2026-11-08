import React, { useState, useMemo, useEffect } from 'react';
import { revisionData, revisionMap } from '../content.js';

export const dailyCheatSheetData = [
  {
    title: "1. Connectors: The Deadly Mismatches",
    subtitle: "What words CANNOT be together in the same part of a sentence",
    rules: [
      {
        signal: "was / were / is / are / had / did (any action/time verb in that part)",
        kill: "❌ KILL: Despite, In spite of, Because of, Due to, In order to",
        winner: "✅ PICK: Although, Even though, Because, Since, While, Unless",
        example: "❌ Despite the plan WAS good ➔ ✅ Although the plan WAS good"
      },
      {
        signal: "NO action/time verb (only 'the / his / its + Thing' or '-ing' before comma)",
        kill: "❌ KILL: Although, Even though, Because, Since, So that",
        winner: "✅ PICK: Despite, In spite of, Because of, Due to",
        example: "❌ Although the heavy rain ➔ ✅ Despite the heavy rain"
      },
      {
        signal: "; ___, (Semicolon before blank + comma after blank)",
        kill: "❌ KILL: Although, Because, Since, Despite, Unless, But, So",
        winner: "✅ PICK: However (twist), Therefore (result), Nevertheless",
        example: "❌ ...was viable; although, the board... ➔ ✅ ...was viable; however, the board..."
      },
      {
        signal: "could / can / would / might (after the subject)",
        kill: "❌ KILL: in order to, because of, despite",
        winner: "✅ PICK: so that (or in order that)",
        example: "❌ ...in order to staff COULD verify ➔ ✅ ...so that staff COULD verify"
      },
      {
        signal: "Plain action word right after blank (___ verify / ___ curb)",
        kill: "❌ KILL: so that, because, although, despite",
        winner: "✅ PICK: in order to / so as to / to",
        example: "❌ ...so that verify the claims ➔ ✅ ...in order to verify the claims"
      },
      {
        signal: "not / never / doesn't inside the blank's part",
        kill: "❌ KILL: Unless, Lest (already have 'not' inside!)",
        winner: "✅ PICK: If (or remove 'not' to use Unless)",
        example: "❌ Unless you do NOT pay ➔ ✅ Unless you pay"
      },
      {
        signal: "Rule / Deal vs Clock Time",
        kill: "Don't mix up condition and clock time!",
        winner: "✅ UNLESS = Rule / Deal ('if not') | UNTIL = Clock / Waiting Time ('till then')",
        example: "No loan UNLESS you sign (Rule) | Wait UNTIL Monday (Time)"
      },
      {
        signal: "'of' right after the blank (___ of)",
        kill: "❌ KILL: Despite (NEVER 'despite of'!)",
        winner: "✅ PICK: In spite of / Because of",
        example: "❌ Despite of the delay ➔ ✅ In spite of the delay"
      },
      {
        signal: "'than' later in sentence",
        kill: "❌ KILL: Hardly, Scarcely",
        winner: "✅ PICK: No sooner (...than)",
        example: "No sooner had he left THAN the phone rang."
      },
      {
        signal: "'when' later in sentence",
        kill: "❌ KILL: No sooner",
        winner: "✅ PICK: Hardly / Scarcely (...when)",
        example: "Hardly had he left WHEN the phone rang."
      },
      {
        signal: "'should' after subject in a warning",
        kill: "❌ KILL: because, although",
        winner: "✅ PICK: lest (...should)",
        example: "Double check lest an error SHOULD occur."
      },
      {
        signal: "'but' in the second part",
        kill: "❌ KILL: Although (NEVER say 'Although... but'!)",
        winner: "✅ PICK: Just a comma with Although (or drop Although to use but)",
        example: "❌ Although he ran, but he missed ➔ ✅ Although he ran, he missed"
      }
    ]
  },
  {
    title: "2. Errors & Correction: The Instant Red Flags",
    subtitle: "Words that instantly tell you if the verb or preposition is broken",
    rules: [
      {
        signal: "Each of / Every one of / Neither of / Either of (no 'who/that')",
        kill: "❌ KILL: are, were, have, action words without -s",
        winner: "✅ MUST BE: is, was, has, action words with -s (singular!)",
        example: "❌ Each of the banks HAVE ➔ ✅ Each of the banks HAS"
      },
      {
        signal: "[Singular word] + along with / as well as + [Plural words]",
        kill: "❌ KILL: were, are, have (don't get tricked by the middle words!)",
        winner: "✅ MUST BE: was, is, has (matches the FIRST singular word!)",
        example: "The manager, along with five clerks, WAS present."
      },
      {
        signal: "Neither A nor B / Either A or B",
        kill: "Don't match with Person A!",
        winner: "✅ Verb copies Person B (the nearest neighbor next to the verb!)",
        example: "Neither the boss nor the CLERKS were (matches clerks)"
      },
      {
        signal: "did / didn't / does / doesn't / to",
        kill: "❌ KILL: Past tense -ed verbs (did approved, did went, to verified)",
        winner: "✅ MUST BE: Base verb V1 (did approve, did go, to verify)",
        example: "❌ The bank did not approved ➔ ✅ The bank did not approve"
      },
      {
        signal: "since [year/day] OR for [5 years / 2 days]",
        kill: "❌ KILL: is, am, are, was, were",
        winner: "✅ MUST BE: has been / have been / had been",
        example: "❌ He IS working here since 2020 ➔ ✅ He HAS BEEN working..."
      },
      {
        signal: "senior / junior / superior / inferior / prior / prefer",
        kill: "❌ KILL: than, more (never 'senior than me'!)",
        winner: "✅ MUST BE: to",
        example: "❌ Senior than me ➔ ✅ Senior TO me"
      },
      {
        signal: "equipment / furniture / information / advice / luggage",
        kill: "❌ KILL: plural -s (equipments), a/an, many, were",
        winner: "✅ MUST BE: singular form (equipment was...)",
        example: "❌ New furnitures were bought ➔ ✅ New furniture was bought"
      },
      {
        signal: "revert / return / refund / recall",
        kill: "❌ KILL: putting 'back' right after them!",
        winner: "✅ MUST BE: alone without 'back'",
        example: "❌ Please revert back soon ➔ ✅ Please revert soon"
      },
      {
        signal: "Sentence starts with '-ing' action (Reviewing the file, ...)",
        kill: "❌ KILL: putting a non-human thing right after the comma!",
        winner: "✅ The real human doer MUST be the 1st word after comma!",
        example: "❌ Reviewing the file, an error was found ➔ ✅ Reviewing the file, the AUDITOR found..."
      }
    ]
  },
  {
    title: "3. Cloze Test: Preposition Marriage Locks",
    subtitle: "Even if 5 words mean 'obey' or 'stop', only 1 can marry the preposition!",
    rules: [
      {
        signal: "___ with",
        kill: "❌ KILL: adhere, conform, rely, refrain, abstain",
        winner: "✅ PICK: comply with, align with, grapple with, dispense with",
        example: "comply WITH guidelines"
      },
      {
        signal: "___ to (followed by noun/action)",
        kill: "❌ KILL: comply, refrain, abstain, prevent",
        winner: "✅ PICK: adhere to, conform to, prone to, subject to, conducive to",
        example: "adhere TO guidelines"
      },
      {
        signal: "___ from",
        kill: "❌ KILL: adhere, comply, avoid (never 'avoid from'!)",
        winner: "✅ PICK: refrain from, abstain from, deter from, preclude from",
        example: "refrain FROM trading / deter FROM cheating"
      },
      {
        signal: "___ upon / on",
        kill: "❌ KILL: subject (subject takes 'to'!), comply, adhere",
        winner: "✅ PICK: contingent upon, dependent upon, hinge on",
        example: "contingent UPON approval"
      },
      {
        signal: "an ___ (right before the blank)",
        kill: "❌ KILL: Words starting with consonant sound (cursory, thorough, prudent)",
        winner: "✅ PICK: Words starting with vowel sound (exhaustive, explicit, adverse)",
        example: "an EXHAUSTIVE audit (not 'an cursory')"
      },
      {
        signal: "Relief until [a later date / next month]",
        kill: "❌ KILL: waive, cancel (means forgiven forever!)",
        winner: "✅ PICK: defer / postpone (means delayed until later)",
        example: "DEFER payments until June (not waive)"
      }
    ]
  },
  {
    title: "4. Idioms & Phrasal Verbs: The Object Matcher",
    subtitle: "Look at the object right after the blank to kill wrong options",
    rules: [
      {
        signal: "Future time mentioned (until Friday / to next month)",
        kill: "❌ KILL: call off (means dead forever)",
        winner: "✅ PICK: put off (means postponed / delayed)",
        example: "PUT OFF the meeting until Friday"
      },
      {
        signal: "The object is 'the possibility / fraud / human error'",
        kill: "❌ KILL: turn down, call off, put off",
        winner: "✅ PICK: rule out (= eliminate / say impossible)",
        example: "cannot RULE OUT the possibility"
      },
      {
        signal: "The object is 'an offer / a loan request / a candidate'",
        kill: "❌ KILL: rule out, look into",
        winner: "✅ PICK: turn down (= reject / say no to an offer)",
        example: "TURN DOWN the buyout offer"
      },
      {
        signal: "The object is 'an audit / inspection / review / test'",
        kill: "❌ KILL: look into, turn down",
        winner: "✅ PICK: carry out (= perform / do)",
        example: "CARRY OUT an inspection"
      },
      {
        signal: "The object is 'a complaint / mystery / discrepancy'",
        kill: "❌ KILL: carry out, call off",
        winner: "✅ PICK: look into (= investigate)",
        example: "LOOK INTO the customer complaint"
      },
      {
        signal: "Pronoun 'it / them' used with phrasal verb",
        kill: "❌ KILL: turn down it, call off it, carry out it",
        winner: "✅ MUST BE: Pronoun in the middle sandwich!",
        example: "turn IT down / call IT off / carry IT out"
      }
    ]
  },
  {
    title: "5. Confusable Twins: The 1-Letter Memory Tricks",
    subtitle: "Spot the 1 letter that kills the wrong twin",
    rules: [
      {
        signal: "Loan money or Head person",
        kill: "❌ KILL: principle (ends in -le = moral ru-LE)",
        winner: "✅ PICK: principal (ends in -pal = main money/person)",
        example: "principal amount / principal repayment"
      },
      {
        signal: "Envelopes, paper & pens",
        kill: "❌ KILL: stationary (ends in -ary = anchor / standing still)",
        winner: "✅ PICK: stationery (has 'e' for envelope!)",
        example: "office stationery"
      },
      {
        signal: "Compliment vs Complement",
        kill: "Compl-I-ment (I = 'I look nice!' ➔ praise)",
        winner: "✅ Compl-E-ment (E = complEte ➔ enhances / goes well together)",
        example: "Doorstep service COMPLEMENTS digital kiosks"
      },
      {
        signal: "Disinterested vs Uninterested",
        kill: "Uninterested = bored / doesn't care",
        winner: "✅ Disinterested = fair / neutral / unbiased (like a judge or auditor!)",
        example: "A DISINTERESTED arbitrator"
      }
    ]
  }
];

function RevisionDrillCard({ drill, index }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  const isAnswered = selectedOption !== null || showSolution;
  const isCorrect = selectedOption === drill.answer;
  const pickedTwinTrap = selectedOption === drill.twinFoil;

  function handleSelectOption(opt) {
    if (selectedOption !== null) return;
    setSelectedOption(opt);
    setShowSolution(true);
  }

  function handleReset() {
    setSelectedOption(null);
    setShowSolution(false);
  }

  return (
    <div className="rule-card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="trick-badge">{drill.badge || `Revision Drill #${index + 1}`}</span>
        <span className="small muted">{drill.ruleRef}</span>
      </div>

      <p className="font-semibold text-base my-2">
        Q{index + 1}. {drill.prompt}
      </p>

      <div className="my-3">
        {drill.options.map((opt, i) => {
          let cls = 'option';
          if (isAnswered) {
            if (opt === drill.answer) cls += ' correct';
            else if (opt === selectedOption) cls += ' incorrect';
          }
          return (
            <button
              key={opt}
              className={cls}
              disabled={selectedOption !== null}
              onClick={() => handleSelectOption(opt)}
            >
              <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
              {isAnswered && opt === drill.answer && ' ✓ (Winner)'}
              {isAnswered && opt === drill.twinFoil && opt !== drill.answer && ' ⚠️ (Confusing Twin Trap)'}
              {isAnswered && opt === selectedOption && opt !== drill.answer && ' (Your choice)'}
            </button>
          );
        })}
      </div>

      {!isAnswered && (
        <div className="mt-2">
          <button className="small" onClick={() => setShowSolution(true)}>
            Show step-by-step trick without guessing
          </button>
        </div>
      )}

      {isAnswered && (
        <div className="mt-3 pt-3 border-t border">
          {selectedOption !== null && (
            <div className={`answer-status ${isCorrect ? '' : 'wrong'}`}>
              {isCorrect ? (
                <>
                  <strong>Spot on!</strong> You picked <strong>{drill.answer}</strong> and beat the confusing twin trap (<strong>{drill.twinFoil}</strong>).
                </>
              ) : pickedTwinTrap ? (
                <>
                  <strong>Aha! You fell for the Confusing Twin ({drill.twinFoil})!</strong> Don't worry—almost everyone picks <strong>{drill.twinFoil}</strong> when reading by ear. Read Step 2 and Step 3 below to see how to beat this trap every time!
                </>
              ) : (
                <>
                  <strong>Not quite.</strong> Correct answer: <strong>{drill.answer}</strong> (Closest confusing twin: <strong>{drill.twinFoil}</strong>). Follow the 3 steps below!
                </>
              )}
            </div>
          )}

          <div className="grid gap-2 my-2">
            <div className="step-card">
              <strong className="text-sm text-[#2b4c37] block mb-1">
                1️⃣ What the Sentence Is Trying to Say (Eliminate by Story):
              </strong>
              <p className="small mb-0">{drill.whatSentenceSays}</p>
            </div>

            <div className="trap-card my-0">
              <strong className="text-sm text-[#8a4430] block mb-1">
                2️⃣ Why 2 Options Both Feel Correct ("{drill.answer}" vs "{drill.twinFoil}"):
              </strong>
              <p className="small mb-0">{drill.whyTwoFeelCorrect}</p>
            </div>

            <div className="example-pass my-0 p-3">
              <strong className="text-sm text-[#2b4c37] block mb-1">
                3️⃣ How to Confidently Pick the Winner (Using the Rule on Top):
              </strong>
              <p className="small mb-1">{drill.howToPickWinner}</p>
              <p className="small font-semibold text-[#35583c] mb-0">
                📌 {drill.ruleRef}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <button className="small" onClick={handleReset}>
              Try this question again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Revision({ activeChapterId, onSelectChapter, onPracticeChapter }) {
  const [viewMode, setViewMode] = useState('cheatsheet'); // 'cheatsheet' or 'chapters'
  const [selectedId, setSelectedId] = useState(activeChapterId || 'connectors');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (activeChapterId && revisionMap.has(activeChapterId)) {
      setSelectedId(activeChapterId);
    }
  }, [activeChapterId]);

  const currentChapter = useMemo(() => {
    return revisionMap.get(selectedId) || revisionData[0];
  }, [selectedId]);

  // Global search across all chapters & cheat sheet
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const matches = [];
    for (const chap of revisionData) {
      const matchedDict = (chap.plainDictionary || []).filter(d =>
        d.term.toLowerCase().includes(q) ||
        d.simpleMeaning.toLowerCase().includes(q) ||
        d.examples.toLowerCase().includes(q)
      );
      const matchedRules = (chap.goldenRules || []).filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.formula.toLowerCase().includes(q) ||
        r.explanation.toLowerCase().includes(q) ||
        r.trick?.toLowerCase().includes(q) ||
        r.correctExample?.toLowerCase().includes(q)
      );
      const matchedTraps = (chap.examTraps || []).filter(t =>
        t.trapName.toLowerCase().includes(q) ||
        t.whyIntuitionFails.toLowerCase().includes(q) ||
        t.theFix.toLowerCase().includes(q) ||
        t.examPattern.toLowerCase().includes(q)
      );
      const matchedPairs = (chap.fixedPairs || []).filter(p =>
        p.pair.toLowerCase().includes(q) ||
        p.rule.toLowerCase().includes(q) ||
        p.trap.toLowerCase().includes(q)
      );
      const matchedDrills = (chap.practiceDrills || []).filter(d =>
        d.prompt.toLowerCase().includes(q) ||
        d.badge.toLowerCase().includes(q) ||
        d.whyTwoFeelCorrect.toLowerCase().includes(q) ||
        d.howToPickWinner.toLowerCase().includes(q)
      );
      if (
        matchedDict.length ||
        matchedRules.length ||
        matchedTraps.length ||
        matchedPairs.length ||
        matchedDrills.length ||
        chap.title.toLowerCase().includes(q)
      ) {
        matches.push({
          chapter: chap,
          dict: matchedDict,
          rules: matchedRules,
          traps: matchedTraps,
          pairs: matchedPairs,
          drills: matchedDrills
        });
      }
    }
    return matches;
  }, [query]);

  function handleSelect(id) {
    setSelectedId(id);
    setViewMode('chapters');
    if (onSelectChapter) onSelectChapter(id);
  }

  return (
    <div className="revision-container">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border pb-3 mb-4">
        <div>
          <h2>Revision Sheets & Instant Kill-Switches</h2>
          <p className="small muted">
            Easy-to-recall daily rules (zero jargon) + 'Why 2 Options Feel Right' interactive drills.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <input
            type="search"
            aria-label="Search revision tricks and formulas"
            placeholder="Search (e.g. was, despite, until, comply)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full sm:w-80"
          />
        </div>
      </div>

      {/* Main Mode Toggle */}
      <div className="flex flex-wrap gap-2 mb-4" aria-label="Revision views">
        <button
          className={viewMode === 'cheatsheet' ? 'primary font-semibold' : ''}
          onClick={() => { setViewMode('cheatsheet'); setQuery(''); }}
        >
          ⚡ 2-Minute Daily Cheat Sheet (Instant Kill-Switches)
        </button>
        <button
          className={viewMode === 'chapters' ? 'primary font-semibold' : ''}
          onClick={() => { setViewMode('chapters'); setQuery(''); }}
        >
          📚 Chapter Deep-Dives, Dictionaries & Practice Drills
        </button>
      </div>

      {query.trim() ? (
        <section aria-label="Search results" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3>Search results for "{query}"</h3>
            <button className="small" onClick={() => setQuery('')}>Clear search</button>
          </div>
          {searchResults && searchResults.length > 0 ? (
            searchResults.map(res => (
              <div key={res.chapter.chapterId} className="rule-card mb-4">
                <div className="flex items-center justify-between border-b border pb-2 mb-3">
                  <h4 className="font-semibold text-base">
                    {res.chapter.priority ? '⭐ ' : ''}{res.chapter.title}{' '}
                    <span className="small muted font-normal">({res.chapter.tagline})</span>
                  </h4>
                  <button
                    className="small primary"
                    onClick={() => { setSelectedId(res.chapter.chapterId); setViewMode('chapters'); setQuery(''); }}
                  >
                    Open full chapter sheet
                  </button>
                </div>
                {res.dict.map((d, idx) => (
                  <div key={idx} className="step-card mb-2 small">
                    <strong>👶 Plain-English Meaning — {d.term}:</strong> {d.simpleMeaning}
                    <div className="muted mt-1">{d.examples}</div>
                  </div>
                ))}
                {res.rules.map((rule, idx) => (
                  <div key={idx} className="mb-3">
                    <span className="trick-badge">Simple Rule</span>
                    <strong> {rule.name}</strong>
                    <div className="formula-box">{rule.formula}</div>
                    <p className="small">{rule.explanation}</p>
                    {rule.trick && <p className="small"><strong>💡 Trick:</strong> {rule.trick}</p>}
                  </div>
                ))}
                {res.traps.map((trap, idx) => (
                  <div key={idx} className="trap-card mt-2">
                    <span className="trap-badge">Exam Trap</span>
                    <strong> {trap.trapName}</strong>
                    <p className="small"><strong>Why intuition fails:</strong> {trap.whyIntuitionFails}</p>
                    <p className="small"><strong>The fix:</strong> {trap.theFix}</p>
                  </div>
                ))}
                {res.pairs.map((p, idx) => (
                  <div key={idx} className="step-card mt-2 small">
                    <strong>{p.pair}:</strong> {p.rule}
                    <p className="muted mb-0"><strong>Trap:</strong> {p.trap}</p>
                  </div>
                ))}
                {res.drills.map((d, idx) => (
                  <RevisionDrillCard key={d.id || idx} drill={d} index={idx} />
                ))}
              </div>
            ))
          ) : (
            <p className="muted">No rules found matching "{query}". Try searching for "was", "despite", "because of", "until", or "comply".</p>
          )}
        </section>
      ) : viewMode === 'cheatsheet' ? (
        /* DAILY 2-MINUTE CHEAT SHEET */
        <section aria-labelledby="cheatsheet-heading" className="mb-6">
          <div className="bg-[#edf4e6] border border-[#b3c4aa] rounded p-4 mb-5">
            <h3 id="cheatsheet-heading" className="text-lg font-semibold text-[#2b4c37] mb-1">
              ⚡ 2-Minute Daily Cheat Sheet (Read Every Day Before Practicing)
            </h3>
            <p className="small mb-0">
              No long paragraphs! Just instant <strong>"If you see Word X in the sentence ➔ Instantly KILL Option Y"</strong> memory anchors.
            </p>
          </div>

          <div className="grid gap-6">
            {dailyCheatSheetData.map((sec, sIdx) => (
              <div key={sIdx} className="rule-card my-0">
                <div className="border-b border pb-2 mb-3">
                  <h4 className="font-semibold text-base text-[#2b4c37]">{sec.title}</h4>
                  <p className="small muted mb-0">{sec.subtitle}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="progress-table">
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>If You See This Word / Signal</th>
                        <th style={{ width: '36%' }}>❌ NEVER Use (Instant Kill)</th>
                        <th style={{ width: '36%' }}>✅ Must Pick Instead</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.rules.map((r, rIdx) => (
                        <tr key={rIdx}>
                          <td className="small font-semibold text-[#292d29]">
                            {r.signal}
                          </td>
                          <td className="small text-[#8a4430] font-medium">
                            {r.kill}
                          </td>
                          <td className="small">
                            <div className="text-[#2b4c37] font-semibold">{r.winner}</div>
                            {r.example && <div className="small muted mt-1 font-mono text-xs">{r.example}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border pt-4 mt-6">
            <span className="small muted">Want to practice questions testing these exact kill rules?</span>
            <button
              className="primary text-sm font-semibold"
              onClick={() => { setViewMode('chapters'); setSelectedId('connectors'); }}
            >
              Switch to Chapter Deep-Dives & Drills →
            </button>
          </div>
        </section>
      ) : (
        /* CHAPTER DEEP-DIVES VIEW */
        <>
          {/* Priority Focus Chapters Banner */}
          <div className="mb-3">
            <span className="small font-semibold text-[#2d5038] block mb-2">
              ⭐ Priority Focus Chapters (Deep-Dive Simple Guides + Interactive Twin Drills):
            </span>
            <div className="flex flex-wrap gap-2 mb-3" aria-label="Priority revision chapters">
              {revisionData.filter(c => c.priority).map(c => (
                <button
                  key={c.chapterId}
                  className={c.chapterId === currentChapter.chapterId ? 'primary font-semibold' : ''}
                  onClick={() => handleSelect(c.chapterId)}
                  aria-pressed={c.chapterId === currentChapter.chapterId}
                >
                  ⭐ {c.title}
                </button>
              ))}
            </div>
            <span className="small muted block mb-1">All Other Chapters:</span>
            <div className="flex flex-wrap gap-2 mb-5" aria-label="Other revision chapters">
              {revisionData.filter(c => !c.priority).map(c => (
                <button
                  key={c.chapterId}
                  className={c.chapterId === currentChapter.chapterId ? 'primary' : ''}
                  onClick={() => handleSelect(c.chapterId)}
                  aria-pressed={c.chapterId === currentChapter.chapterId}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Chapter Revision Sheet */}
          <article className="chapter-sheet" aria-labelledby="chapter-sheet-title">
            <div className="flex flex-wrap items-start justify-between gap-3 bg-white border border rounded p-4 mb-5">
              <div>
                <h3 id="chapter-sheet-title" className="text-lg font-semibold mb-1">
                  {currentChapter.priority ? '⭐ ' : ''}{currentChapter.title}
                </h3>
                <p className="small font-medium text-[#47684b] mb-1">{currentChapter.tagline}</p>
                <p className="small muted max-w-3xl mb-0">{currentChapter.summary}</p>
              </div>
              {onPracticeChapter && (
                <button
                  className="primary shrink-0 text-sm"
                  onClick={() => onPracticeChapter(currentChapter.chapterId)}
                >
                  🚀 Full Chapter Practice ({currentChapter.title})
                </button>
              )}
            </div>

            {/* Section 0: Plain-English Kid's Dictionary (Zero Grammar Jargon!) */}
            {currentChapter.plainDictionary?.length > 0 && (
              <section className="mb-6" aria-labelledby="plain-dict-title">
                <h4 id="plain-dict-title" className="font-semibold text-base mb-1">
                  👶 Plain-English Kid's Dictionary (No Scary Grammar Words!)
                </h4>
                <p className="small muted mb-3">
                  Whenever solutions use big grammar words like "clause" or "noun phrase", here is what they actually mean in simple everyday language:
                </p>
                <div className="grid gap-2">
                  {currentChapter.plainDictionary.map((item, i) => (
                    <div key={i} className="rule-card my-0 py-3">
                      <strong className="text-sm text-[#2b4c37] block mb-1">
                        📘 {item.term}
                      </strong>
                      <p className="small mb-1">{item.simpleMeaning}</p>
                      <div className="formula-box my-1 py-1 px-2 text-xs">{item.examples}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 1: What Is the Sentence Trying to Say? (Sentence Context Decoder) */}
            {currentChapter.sentenceDecoder && (
              <section className="mb-6" aria-labelledby="sentence-decoder-title">
                <h4 id="sentence-decoder-title" className="font-semibold text-base mb-1">
                  {currentChapter.sentenceDecoder.title}
                </h4>
                <p className="small muted mb-3">
                  {currentChapter.sentenceDecoder.subtitle}
                </p>
                <div className="grid gap-3">
                  {currentChapter.sentenceDecoder.patterns.map((p, i) => (
                    <div key={i} className="rule-card my-0">
                      <strong className="text-base text-[#2b4c37] block mb-1">{p.storyType}</strong>
                      <p className="small mb-2"><strong>How to spot it in the sentence:</strong> {p.howToSpot}</p>
                      <div className="example-pass my-1">
                        <strong>✅ Keep ONLY these:</strong> {p.keepOnly}
                      </div>
                      <div className="example-fail my-1">
                        <strong>❌ Eliminate immediately:</strong> {p.eliminateImmediately}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 2: 3-Second Quick-Scan & Decision Guide */}
            {currentChapter.decisionSteps?.length > 0 && (
              <section className="mb-6" aria-labelledby="quick-scan-title">
                <h4 id="quick-scan-title" className="font-semibold text-base mb-2">
                  🎯 3-Second Step-by-Step Checklist
                </h4>
                <div className="grid gap-2">
                  {currentChapter.decisionSteps.map((s, i) => (
                    <div key={i} className="step-card">
                      <div className="font-semibold text-sm text-[#2b4c37] mb-1">{s.step}</div>
                      <p className="small mb-1"><strong>What to look at:</strong> {s.action}</p>
                      <p className="small muted mb-0"><strong>Result:</strong> {s.outcome}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 3: Golden Rules & Simple Pattern Recognition Formulas */}
            {currentChapter.goldenRules?.length > 0 && (
              <section className="mb-6" aria-labelledby="golden-rules-title">
                <h4 id="golden-rules-title" className="font-semibold text-base mb-2">
                  ⚡ Easy-to-Remember Rules & Pattern Formulas
                </h4>
                <div className="grid gap-4">
                  {currentChapter.goldenRules.map((rule, i) => (
                    <div key={i} className="rule-card">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-base">{rule.name}</h5>
                        <span className="trick-badge">Fact #{i + 1}</span>
                      </div>
                      <div className="formula-box">{rule.formula}</div>
                      <p className="small mb-2">{rule.explanation}</p>
                      {rule.correctExample && (
                        <div className="example-pass" style={{ whiteSpace: 'pre-wrap' }}>
                          {rule.correctExample}
                        </div>
                      )}
                      {rule.incorrectExample && (
                        <div className="example-fail" style={{ whiteSpace: 'pre-wrap' }}>
                          {rule.incorrectExample}
                        </div>
                      )}
                      {rule.trick && (
                        <div className="mt-3 small bg-[#f6f8f4] border border-[#d8ddd1] rounded p-2">
                          <strong>💡 3-Second Kid Trick:</strong> {rule.trick}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 4: Exam Traps & Why 2 Words Sound Identical in Your Head */}
            {currentChapter.examTraps?.length > 0 && (
              <section className="mb-6" aria-labelledby="exam-traps-title">
                <h4 id="exam-traps-title" className="font-semibold text-base mb-2">
                  ⚠️ Why 2 Options Sound Right in Your Head (And How to Beat the Trap)
                </h4>
                <div className="grid gap-3">
                  {currentChapter.examTraps.map((trap, i) => (
                    <div key={i} className="trap-card">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-sm">{trap.trapName}</strong>
                        <span className="trap-badge">Twin Trap Buster</span>
                      </div>
                      <p className="small mb-1">
                        <strong>Why both sound right when reading:</strong> {trap.whyIntuitionFails}
                      </p>
                      <p className="small mb-1 text-[#2d5038]">
                        <strong>How to pick the right one:</strong> {trap.theFix}
                      </p>
                      {trap.examPattern && (
                        <p className="small muted mb-0">
                          <strong>Quick pattern:</strong> {trap.examPattern}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 5: High-Yield Best-Friend Twin Pairs */}
            {currentChapter.fixedPairs?.length > 0 && (
              <section className="mb-6" aria-labelledby="fixed-pairs-title">
                <h4 id="fixed-pairs-title" className="font-semibold text-base mb-2">
                  📋 Best-Friend Twin Words & Fixed Pairs Cheat Sheet
                </h4>
                <div className="overflow-x-auto">
                  <table className="progress-table">
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>Pair / Words</th>
                        <th style={{ width: '42%' }}>Simple Rule & Example</th>
                        <th style={{ width: '30%' }}>What Trap to Watch For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentChapter.fixedPairs.map((pair, i) => (
                        <tr key={i}>
                          <td className="font-mono text-sm font-semibold">{pair.pair}</td>
                          <td className="small">
                            <p className="mb-1">{pair.rule}</p>
                            <em className="text-[#35583c]">{pair.example}</em>
                          </td>
                          <td className="small text-[#8a4430]">{pair.trap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Section 6: Interactive Revision Practice Drills ("Why 2 Options Feel Correct") */}
            {currentChapter.practiceDrills?.length > 0 && (
              <section className="mb-6" aria-labelledby="practice-drills-title">
                <div className="bg-[#edf4e6] border border-[#b3c4aa] rounded p-3 mb-3">
                  <h4 id="practice-drills-title" className="font-semibold text-base text-[#2b4c37] mb-1">
                    🏋️ Practice What You Just Learned ("Why 2 Options Feel Right" Drills)
                  </h4>
                  <p className="small mb-0">
                    Click an option below to test yourself! Each solution shows: (1) What the sentence is trying to say to eliminate bad options, (2) Why 2 options feel right when reading, and (3) Which exact rule on top proves the winner!
                  </p>
                </div>
                <div className="grid gap-4">
                  {currentChapter.practiceDrills.map((drill, i) => (
                    <RevisionDrillCard key={drill.id || i} drill={drill} index={i} />
                  ))}
                </div>
              </section>
            )}

            <div className="flex justify-between items-center border-t border pt-4 mt-6">
              <span className="small muted">Ready to solve full sets in {currentChapter.title}?</span>
              {onPracticeChapter && (
                <button
                  className="primary text-sm"
                  onClick={() => onPracticeChapter(currentChapter.chapterId)}
                >
                  Go to {currentChapter.title} Practice Sets →
                </button>
              )}
            </div>
          </article>
        </>
      )}
    </div>
  );
}

/**
 * Compact inline revision card designed to be embedded directly at the top of the Practice view.
 */
export function ChapterQuickRevision({ chapterId, onOpenFullSheet }) {
  const data = revisionMap.get(chapterId);
  if (!data) return null;

  return (
    <details className="mb-5 bg-white border border rounded p-3 text-sm">
      <summary className="font-semibold cursor-pointer text-base text-[#2d5038] flex items-center justify-between">
        <span>📖 Simple Revision Tricks & Story Clues: {data.title}</span>
        <span className="small muted font-normal ml-2">(Click to open simple rules & twin-word tricks)</span>
      </summary>

      <div className="mt-3 pt-3 border-t border">
        <p className="small muted mb-3">{data.summary}</p>

        {/* Plain English Dictionary Preview */}
        {data.plainDictionary?.length > 0 && (
          <div className="mb-3">
            <strong className="text-xs uppercase tracking-wider text-neutral-600 block mb-1">
              👶 Plain-English Meaning (No Grammar Jargon):
            </strong>
            <div className="grid gap-1">
              {data.plainDictionary.map((d, idx) => (
                <div key={idx} className="small bg-[#fbfcf9] border border-[#e1e5dc] rounded px-2 py-1">
                  <strong>{d.term}:</strong> {d.simpleMeaning} <span className="muted">({d.examples})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Golden Rules */}
        {data.goldenRules?.length > 0 && (
          <div className="mb-3">
            <strong className="text-xs uppercase tracking-wider text-neutral-600 block mb-1">
              ⚡ Top Formulas & Kid Tricks:
            </strong>
            {data.goldenRules.slice(0, 3).map((rule, idx) => (
              <div key={idx} className="mb-2">
                <strong className="small block">{rule.name}</strong>
                <div className="formula-box text-xs py-1 px-2 mb-1">{rule.formula}</div>
                {rule.trick && <p className="small mb-0"><strong>💡 Trick:</strong> {rule.trick}</p>}
              </div>
            ))}
          </div>
        )}

        {onOpenFullSheet && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-[#edf4e6] border border-[#b3c4aa] rounded p-2">
            <span className="small font-medium text-[#2b4c37]">
              Want to see the 2-Minute Daily Cheat Sheet or test yourself on drills?
            </span>
            <button
              className="small primary font-semibold"
              onClick={() => onOpenFullSheet(chapterId)}
            >
              Open 2-Min Cheat Sheet & Practice Drills →
            </button>
          </div>
        )}
      </div>
    </details>
  );
}
