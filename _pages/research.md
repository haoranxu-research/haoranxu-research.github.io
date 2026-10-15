---
layout: editorial
title: Research
permalink: /research/
editorial_section: research
nav: true
nav_order: 1
---

<section class="research-intro">
  <p class="eyebrow" data-enter>02 / Research</p>
  <h1 class="editorial-title" data-enter style="--delay: 80ms">Learning, from<br><em>two perspectives.</em></h1>
  <p class="page-deck" data-enter style="--delay: 160ms">Understanding what exists. Exploring what could be.<br>Two connected directions for an ongoing inquiry.</p>
</section>

<section class="research-study" aria-label="Research directions" data-reveal>
  <noscript><style>.line-study, .research-tabs { display: none; } .study-grid { grid-template-columns: 1fr; } .research-panel[hidden] { display: block !important; } .research-panel + .research-panel { margin-top: 3rem; }</style></noscript>
  <div class="study-heading">
    <p class="eyebrow">A change of perspective</p>
    <div class="research-tabs" role="tablist" aria-label="Choose a research direction">
      <button id="understanding" role="tab" aria-selected="true" aria-controls="understanding-panel" tabindex="0" data-mode="understanding"><span>01</span> Understanding</button>
      <button id="designing" role="tab" aria-selected="false" aria-controls="designing-panel" tabindex="-1" data-mode="designing"><span>02</span> Designing</button>
    </div>
  </div>
  <div class="study-grid">
    <div class="line-study">
      <canvas id="research-field" aria-hidden="true" width="640" height="440"></canvas>
      <div class="field-caption"><span class="field-caption-text">Structure, observed.</span><span class="field-sign" aria-hidden="true">∴</span></div>
    </div>
    <div class="research-panels">
      <article class="research-panel" id="understanding-panel" role="tabpanel" aria-labelledby="understanding" tabindex="0">
        <p class="direction-status"><span class="status-dot"></span> A direction of inquiry</p>
        <h2>Understanding<br><em>learning.</em></h2>
        <p>I am interested in the internal computation of existing learning systems: how they behave, where they fail, and what their limitations reveal.</p>
        <ul class="research-threads"><li>Mechanisms &amp; computation</li><li>Diagnosis &amp; failure modes</li><li>Behavior &amp; limitations</li></ul>
      </article>
      <article class="research-panel" id="designing-panel" role="tabpanel" aria-labelledby="designing" tabindex="0" hidden>
        <p class="direction-status"><span class="status-dot sage"></span> An exploratory vision</p>
        <h2>Designing<br><em>learning.</em></h2>
        <p>I am exploring the possibility of new learning algorithms and computational organizations, including different ways for intelligent systems to acquire and organize knowledge.</p>
        <ul class="research-threads"><li>Learning algorithms</li><li>Computational organization</li><li>Acquiring &amp; organizing knowledge</li></ul>
      </article>
    </div>
  </div>
  <div class="study-footnote"><p>Observation and invention inform one another.</p><span>One inquiry, two perspectives.</span></div>
</section>

<div class="page-endnote" data-reveal><p>These directions describe my interests and questions,<br>rather than a list of completed results.</p><a class="arrow-link" href="{{ '/reflections/' | relative_url }}">On to reflections <span aria-hidden="true">→</span></a></div>
