/*
---
description: Creates an Fx.Accordion from any element with Accordion in its data-filters property.  Uses the .toggle elements within the element as the toggles and the .target elements as the targets. 
provides: [Behavior.Accordion]
requires: [Widgets/Behavior, More/Fx.Accordion, Widgets/Element.Data]
script: Behavior.Accordion.js
...
*/

Behavior.addGlobalFilters({
        Accordion: function(element, methods) {
                var toggles = element.get('data', 'toggler-elements') || '.toggle';
                var sections = element.get('data', 'section-elements') || '.target';
                var accordion = new Fx.Accordion(toggles, sections);
                this.markForCleanup(element, function() {
                        accordion.detach();
                });
        }
});

