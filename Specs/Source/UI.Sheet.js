module('UI.Sheet');

function setup(){
	teardown();
	UI.Sheet.define('foo', {base: 2, extended: 1});
	UI.Sheet.define('foo.classA', {extended: 2});
	UI.Sheet.define('foo.classB', {'class': 'b', 'tag': 'foo'});
	UI.Sheet.define('foo.classA.classB', {'class': 'a and b'});
	UI.Sheet.define('foo.classA', {'class': 'a'});

	UI.Sheet.define('nested rule', {'x': 1});
}

function teardown(){
	UI.Sheet.empty();
}



test('should return an empty object when no rule is found', function(){
	same(UI.Sheet.lookup('*'), {});
	same(UI.Sheet.lookup('foo'), {});
});

test('should define multiple rules for comma seperated selectors', function(){
	setup();
	UI.Sheet.define('multiA, multiB', {m: 1});
	same(UI.Sheet.lookup('multiA'), {m: 1});
	same(UI.Sheet.lookup('multiB'), {m: 1});
	same(UI.Sheet.lookup('multiC'), {});
	teardown();
});

test('should define some rules', function(){
	setup();
	UI.Sheet.define('*', {base: 1, asterix: 1});
	same(UI.Sheet.lookup('*'), {base: 1, asterix: 1});
	teardown();
});

test('should merge with *', function(){
	teardown();
	
	UI.Sheet.define('*', {base: 1, asterix: 1});
	same(UI.Sheet.lookup('*'), {base: 1, asterix: 1});
	same(UI.Sheet.lookup('madeup'), {base: 1, asterix: 1});
	
	UI.Sheet.define('foo', {foo:true});
	same(UI.Sheet.lookup('foo'), {foo:true, base: 1, asterix: 1});
	same(UI.Sheet.lookup('.myclass'), {base: 1, asterix: 1});
	same(UI.Sheet.lookup('foo.myclass'), {foo:true, base: 1, asterix: 1});
	
	teardown();
});

test('should find the class', function(){
	teardown();
	
	UI.Sheet.define('.class1', {class1:1})
	same(UI.Sheet.lookup('.class1'), {class1:1})
	
	UI.Sheet.define('.class2', {class2:2})
	same(UI.Sheet.lookup('.class2'), {class2:2})
	
	same(UI.Sheet.lookup('.class1.class2'), {class1:1, class2:2})
	same(UI.Sheet.lookup('.class1.class2.nothing'), {class1:1, class2:2})
	
	UI.Sheet.define('foo', {foo:true})
	same(UI.Sheet.lookup('foo.class1.class2'), {foo:true, class1:1, class2:2})
	same(UI.Sheet.lookup('foo.class1'), {foo:true, class1:1})
	same(UI.Sheet.lookup('foo.class2'), {foo:true, class2:2})
	
	teardown();
});

test('should match nested rules', function(){
	teardown();
	
	UI.Sheet.define('root',{root:1})
	UI.Sheet.define('foo',{foo:1})
	UI.Sheet.define('root *',{"root *":1})
	UI.Sheet.define('foo *',{"foo *":1})
	UI.Sheet.define('root foo',{"root foo":1})
	UI.Sheet.define('foo root',{"foo root":1})
	
	same(UI.Sheet.lookup('root'), {root:1});
	same(UI.Sheet.lookup('root null'), {"root *":1});
	same(UI.Sheet.lookup('root foo'), {foo:1, "root foo":1, "root *":1});
	same(UI.Sheet.lookup('foo root'), {root:1, "foo root":1, "foo *":1});
	
	same(UI.Sheet.lookup('root foo null'), {"root *":1, "foo *":1});
	same(UI.Sheet.lookup('foo root null'), {"root *":1, "foo *":1});
	
	same(UI.Sheet.lookup('root null foo'), {foo:1, "root foo":1, "root *":1});
	same(UI.Sheet.lookup('foo null root'), {root:1, "foo root":1, "foo *":1});
	
	same(UI.Sheet.lookup('null root null foo'), {foo:1, "root foo":1, "root *":1});
	same(UI.Sheet.lookup('null foo null root'), {root:1, "foo root":1, "foo *":1});
	
	same(UI.Sheet.lookup('root .null foo'), {foo:1, "root foo":1, "root *":1});
	same(UI.Sheet.lookup('foo .null root'), {root:1, "foo root":1, "foo *":1});
	
	teardown();
});

test('should match pseudos', function(){
	setup();
	UI.Sheet.define('rule:somePseudo', {base: 2, asterix: 2});

	same(UI.Sheet.lookup('rule:someOtherPseudo'), UI.Sheet.lookup('rule'));
	same(UI.Sheet.lookup('rule:somePseudo'), {base: 2, asterix: 2});
	teardown();
});

test('should match id', function(){
	teardown();
	var s = UI.Sheet
	s.define('tag', {'tag':1});
	s.define('#id', {'#id':1});
	s.define('tag#id', {'tag#id':1});
	
	same(s.lookup('tag'), {'tag':1});
	same(s.lookup('#id'), {'#id':1});
	same(s.lookup('null#id'), {'#id':1});
	same(s.lookup('tag#id'), {'tag':1,'#id':1,'tag#id':1});
	
	teardown();
});

