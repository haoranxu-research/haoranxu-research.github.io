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
</section>

<section class="research-study" aria-label="Research directions" data-reveal>
  <noscript><style>.line-study, .research-tabs { display: none; } .study-grid { grid-template-columns: 1fr; } .research-panel[hidden] { display: block !important; } .research-panel + .research-panel { margin-top: 3rem; }</style></noscript>
  <div class="study-heading">
    <div class="research-tabs" role="tablist" aria-label="Choose a research direction">
      <button id="understanding" role="tab" aria-selected="true" aria-controls="understanding-panel" tabindex="0" data-mode="understanding"><span>01</span> Understanding</button>
      <button id="designing" role="tab" aria-selected="false" aria-controls="designing-panel" tabindex="-1" data-mode="designing"><span>02</span> Designing</button>
    </div>
  </div>
  <div class="study-grid">
    <div class="line-study">
      <canvas id="research-field" aria-hidden="true" width="640" height="440"></canvas>
    </div>
    <div class="research-panels">
      <article class="research-panel" id="understanding-panel" role="tabpanel" aria-labelledby="understanding" tabindex="0">
        <h2>Understanding<br><em>learning.</em></h2>
        <p>I am interested in the internal computation of existing learning systems: how they behave, where they fail, and what their limitations reveal.</p>
        <ul class="research-threads"><li>Mechanisms &amp; computation</li><li>Diagnosis &amp; failure modes</li><li>Behavior &amp; limitations</li></ul>
      </article>
      <article class="research-panel" id="designing-panel" role="tabpanel" aria-labelledby="designing" tabindex="0" hidden>
        <h2>Designing<br><em>learning.</em></h2>
        <p>I am exploring the possibility of new learning algorithms and computational organizations, including different ways for intelligent systems to acquire and organize knowledge.</p>
        <ul class="research-threads"><li>Learning algorithms</li><li>Computational organization</li><li>Acquiring &amp; organizing knowledge</li></ul>
      </article>
    </div>
  </div>
</section>

<section class="inquiry-preview section-rule" aria-labelledby="experience" data-reveal>
  <h2 class="eyebrow" id="experience">Research experience</h2>
  <div class="experience-content">
    <article class="experience-entry">
      <h3>Machine Learning Research</h3>
      <p class="experience-meta">2026&ndash;Present</p>
      <p class="experience-copy">I independently develop research questions and lead their investigation, from mathematical and empirical analysis through experimental design, interpretation, and manuscript preparation. My work explores how learning systems adapt, behave, and generalize.</p>
      <p class="experience-copy">I use controlled experiments, model interventions, and behavioral evaluation to examine learning systems, alongside statistical comparisons and robustness checks to assess the evidence behind an interpretation.</p>
    </article>
    <article class="experience-entry">
      <h3>Earlier Machine Learning Research</h3>
      <p class="experience-meta">2025&ndash;2026 &middot; Zhejiang University &middot; Supervised by Prof. Xinggao Liu</p>
      <p class="experience-copy">I worked on machine learning for soft sensing in biopharmaceutical processes, using industrial multivariate time series from erythromycin fermentation. I explored regression models and examined prediction errors and distribution shifts across production settings.</p>
    </article>
    <p class="experience-copy">Two research manuscripts are currently under peer review.</p>
    <a class="arrow-link" href="{{ site.data.contact.cv_path | relative_url }}" type="application/pdf">Download Academic CV <span aria-hidden="true">&#8599;</span></a>
  </div>
</section>

<section class="public-research inquiry-preview section-rule" aria-labelledby="public-research" data-reveal>
  <h2 class="eyebrow" id="public-research">Public research</h2>
  {% include public_research.liquid %}
</section>

<div class="page-endnote" data-reveal><a class="arrow-link" href="{{ '/' | relative_url }}">About Haoran <span aria-hidden="true">&#8599;</span></a><a class="arrow-link" href="{{ '/reflections/' | relative_url }}">Reflections <span aria-hidden="true">&#8599;</span></a></div>
