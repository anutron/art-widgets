/*
Script: ART.Sheet.js

License:
	MIT-style license.

Requires:
	@require '../Assets/Scripts/jasmine.js'
	@require '../Assets/Scripts/TrivialReporter.js'
	@require '../Assets/Scripts/mootools.js'
	@require '../Assets/Scripts/slickparser.js'
	@require '../../Source/Base/ART.js'
	@require '../../Source/Paint/ART.Sheet.js'
	@require '../Assets/Scripts/jasmine-run.js'
*/

describe('ART.Sheet', function(){
	
	describe('lookupStyle - no rules defined.', function(){
		
		it('should return an empty object when no rule is found', function(){
			expect(ART.Sheet.lookupStyle('*')).toEqual({});
			expect(ART.Sheet.lookupStyle('foo')).toEqual({});
		});
	});
	
	describe('defineStyle', function(){
		
		it('should define multiple rules for comma seperated selectors', function(){
			ART.Sheet.defineStyle('multiA, multiB', {m: 1});
			expect(ART.Sheet.lookupStyle('multiA')).toEqual({m: 1});
			expect(ART.Sheet.lookupStyle('multiB')).toEqual({m: 1});
			expect(ART.Sheet.lookupStyle('multiC')).toEqual({});
		});
		
		it('should define some rules', function(){
			ART.Sheet.defineStyle('*', {base: 1, asterix: 1});
			expect(ART.Sheet.lookupStyle('*')).toEqual({base: 1, asterix: 1});
			
			ART.Sheet.defineStyle('foo', {base: 2, extended: 1});
			ART.Sheet.defineStyle('foo.classA', {extended: 2});
			ART.Sheet.defineStyle('foo.classB', {'class': 'b', 'tag': 'foo'});
			ART.Sheet.defineStyle('foo.classA.classB', {'class': 'a and b'});
			ART.Sheet.defineStyle('foo.classA', {'class': 'a'});
			
			ART.Sheet.defineStyle('nested rule', {'x': 1});
		});
	});
	
	describe('lookupStyle - rules defined', function(){
		
		it('should merge with *', function(){
			expect(ART.Sheet.lookupStyle('*')).toEqual({base: 1, asterix: 1});
			expect(ART.Sheet.lookupStyle('madeup')).toEqual({base: 1, asterix: 1});
			expect(ART.Sheet.lookupStyle('foo')).toEqual({base: 2, extended: 1, asterix: 1});
		});
		
		it('should find the class', function(){
			expect(ART.Sheet.lookupStyle('.classA')).toEqual({asterix: 1, base: 1});
			expect(ART.Sheet.lookupStyle('foo.classA')).toEqual({asterix: 1, base: 2, extended: 2, 'class': 'a'});
			expect(ART.Sheet.lookupStyle('foo.classA')).toEqual({asterix: 1, base: 2, extended: 2, 'class': 'a'});
			expect(ART.Sheet.lookupStyle('foo.classB.classA.madeup')).toEqual({asterix: 1, base: 2, extended: 2, 'class': 'a and b', tag: 'foo'});
		});
		
		it('should match nested rules', function(){
			expect(ART.Sheet.lookupStyle('rule')).toEqual({asterix: 1, base: 1});
			expect(ART.Sheet.lookupStyle('rule nested')).toEqual({asterix: 1, base: 1});
			expect(ART.Sheet.lookupStyle('nested rule')).toEqual({asterix: 1, base: 1, x: 1});
			expect(ART.Sheet.lookupStyle('xxx nested xxx xxx rule')).toEqual({asterix: 1, base: 1, x: 1});
			expect(ART.Sheet.lookupStyle('xxx nested xxx xxx rule xxx')).toEqual({asterix: 1, base: 1});
			expect(ART.Sheet.lookupStyle('nested.foo rule')).toEqual({asterix: 1, base: 1, x: 1});
		});
	});
	
});
