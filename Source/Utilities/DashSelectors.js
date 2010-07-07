/*
---
name: DashSelectors
description: Allows Selectors with dashes ($$(['data-foo'])) in MooTools 1.2.
provides: DashSelectors
requires: Core/Selectors
...
*/
//allows for selectors like $$('[data-foo-bar]'); TODO: Note that it'll be in Moo 1.3; remove then.
Selectors.RegExps.combined = (/\.([\w-]+)|\[([\w-]+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g);