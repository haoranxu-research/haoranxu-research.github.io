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
      <p class="experience-copy">My recent work spans several areas of machine learning. The questions below reflect some of the projects I have explored, rather than a fixed research agenda.</p>
      <h4 class="experience-topic">Learning and Adaptation</h4>
      <p class="experience-copy">How does a model change when it learns from additional information? I have studied how different ways of updating a model affect its subsequent behavior.</p>
      <h4 class="experience-topic">Multimodal Reasoning</h4>
      <p class="experience-copy">How do models use visual information when they compare or reason about what they see? I have investigated model behavior using controlled visual tasks and targeted interventions.</p>
      <h4 class="experience-topic">Probabilistic Prediction</h4>
      <p class="experience-copy">How does the quality of a prediction depend on what information is available and how it is evaluated? I have examined predictive methods across different evaluation settings.</p>
      <h4 class="experience-topic">Data Organization and Learning</h4>
      <p class="experience-copy">Can different ways of grouping the same training examples lead to different learning outcomes? I explored this question through adaptive data mixing, with a public preprint linked below.</p>
      <p class="experience-copy">Across these projects, I have worked on developing research questions, designing experiments, analyzing results, and preparing manuscripts.</p>
      <p class="experience-copy">Two research manuscripts are currently under peer review. Some ongoing work is described at a high level to preserve anonymity during the review process.</p>
    </article>
    <article class="experience-entry">
      <h3>Earlier Machine Learning Research</h3>
      <p class="experience-meta">2025&ndash;2026 &middot; Zhejiang University &middot; Supervised by Prof. Xinggao Liu</p>
      <p class="experience-copy">I worked on machine learning for soft sensing in biopharmaceutical processes, using industrial multivariate time series from erythromycin fermentation. I explored regression models and examined prediction errors and distribution shifts across production settings.</p>
    </article>
    <a class="arrow-link" href="{{ site.data.contact.cv_path | relative_url }}" type="application/pdf">Download Academic CV <span aria-hidden="true">&#8599;</span></a>
  </div>
</section>

<section class="public-research inquiry-preview section-rule" aria-labelledby="public-research" data-reveal>
  <h2 class="eyebrow" id="public-research">Public research</h2>
  {% include public_research.liquid %}
</section>

<div class="page-endnote" data-reveal><a class="arrow-link" href="{{ '/' | relative_url }}">About Haoran <span aria-hidden="true">&#8599;</span></a><a class="arrow-link" href="{{ '/reflections/' | relative_url }}">Reflections <span aria-hidden="true">&#8599;</span></a></div>
