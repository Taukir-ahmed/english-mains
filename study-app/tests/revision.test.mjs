import test from 'node:test';
import assert from 'node:assert/strict';
import { read, loadChapters } from '../scripts/data-tools.mjs';

test('revision data covers all registered chapters with plain-English dictionary, rules, traps and interactive practice drills', () => {
  const revision = read('revision.json');
  const chapters = loadChapters();

  assert.equal(revision.length, chapters.length, 'Every registered chapter must have a revision sheet');

  for (const { entry } of chapters) {
    const sheet = revision.find(r => r.chapterId === entry.id);
    assert.ok(sheet, `Missing revision sheet for ${entry.id}`);
    assert.ok(sheet.title, `Missing title for ${entry.id}`);
    assert.ok(sheet.tagline, `Missing tagline for ${entry.id}`);
    assert.ok(sheet.summary, `Missing summary for ${entry.id}`);
    assert.ok(Array.isArray(sheet.plainDictionary) && sheet.plainDictionary.length >= 1, `Plain dictionary missing for ${entry.id}`);
    assert.ok(Array.isArray(sheet.decisionSteps) && sheet.decisionSteps.length >= 2, `Decision steps missing for ${entry.id}`);
    for (const step of sheet.decisionSteps) {
      assert.ok(step.step && step.action && step.outcome, `Invalid step in ${entry.id}`);
    }
    assert.ok(Array.isArray(sheet.goldenRules) && sheet.goldenRules.length >= 1, `Golden rules missing for ${entry.id}`);
    for (const rule of sheet.goldenRules) {
      assert.ok(rule.name && rule.formula && rule.explanation, `Invalid golden rule in ${entry.id}`);
      assert.ok(rule.correctExample && rule.incorrectExample, `Missing examples in rule ${rule.name}`);
      assert.ok(rule.trick, `Missing trick in rule ${rule.name}`);
    }
    assert.ok(Array.isArray(sheet.examTraps) && sheet.examTraps.length >= 1, `Exam traps missing for ${entry.id}`);
    for (const trap of sheet.examTraps) {
      assert.ok(trap.trapName && trap.whyIntuitionFails && trap.theFix, `Invalid trap in ${entry.id}`);
    }
    assert.ok(Array.isArray(sheet.practiceDrills) && sheet.practiceDrills.length >= 1, `Practice drills missing for ${entry.id}`);
    for (const drill of sheet.practiceDrills) {
      assert.ok(drill.id && drill.prompt && Array.isArray(drill.options), `Invalid drill in ${entry.id}`);
      assert.ok(drill.options.includes(drill.answer), `Drill answer not in options: ${drill.id}`);
      assert.ok(drill.options.includes(drill.twinFoil), `Drill twinFoil not in options: ${drill.id}`);
      assert.notEqual(drill.answer, drill.twinFoil, `Answer and twinFoil must be distinct: ${drill.id}`);
      assert.ok(drill.whatSentenceSays && drill.whyTwoFeelCorrect && drill.howToPickWinner && drill.ruleRef, `Missing 3-step breakdown in ${drill.id}`);
    }
  }
});

test('priority chapters (connectors, grammar, cloze, idioms-phrasal) have deep-dive sentence decoders and multiple twin drills', () => {
  const revision = read('revision.json');
  const priorityIds = ['connectors', 'grammar', 'cloze', 'idioms-phrasal'];

  for (const id of priorityIds) {
    const sheet = revision.find(r => r.chapterId === id);
    assert.ok(sheet?.priority, `${id} should be marked as priority`);
    assert.ok(sheet.sentenceDecoder?.patterns?.length >= 3, `${id} must have a sentence context decoder`);
    assert.ok(sheet.practiceDrills.length >= 3, `${id} must have at least 3 interactive twin-option practice drills`);
  }

  // Verify Connectors specifically explains Mini-Sentence vs Just a Thing and tests Although vs Despite & Because vs Because of
  const connectors = revision.find(r => r.chapterId === 'connectors');
  assert.ok(connectors.plainDictionary.some(d => d.term.includes('Mini-Sentence') && d.term.includes('Clause')));
  assert.ok(connectors.plainDictionary.some(d => d.term.includes('Just a Thing') && d.term.includes('Noun Phrase')));
  assert.ok(connectors.practiceDrills.some(d => d.answer === 'Although' && d.twinFoil === 'Despite'));
  assert.ok(connectors.practiceDrills.some(d => d.answer === 'because' && d.twinFoil === 'because of'));
});
