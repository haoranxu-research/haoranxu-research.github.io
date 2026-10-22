---
layout: editorial
title: About
permalink: /
editorial_section: about
---

<section class="about-hero">
  <div class="about-words">
    <p class="eyebrow" data-enter style="--delay: 0ms">01 / A brief introduction</p>
    <h1 class="name-title" data-enter style="--delay: 80ms">Haoran Xu</h1>
    <p class="role-line" data-enter style="--delay: 160ms">Undergraduate Researcher &middot; Zhejiang University</p>
    <div class="about-prose" data-enter style="--delay: 230ms">
      <p>I study Control Science and Engineering at <a class="text-link" href="https://www.zju.edu.cn/english/">Zhejiang University</a>. My interests span machine learning, learning algorithms, and adaptive computation.</p>
      <p>I am drawn to two connected questions: how existing learning systems work, and how new ways of learning might be designed.</p>
    </div>
    <div class="about-links" data-enter style="--delay: 300ms">
      <a class="arrow-link" href="{{ site.data.contact.cv_path | relative_url }}" type="application/pdf">Academic CV <span aria-hidden="true">&#8599;</span></a>
      <a class="arrow-link" href="{{ site.data.contact.github_url }}" rel="me noopener" target="_blank">GitHub <span aria-hidden="true">↗</span></a>
      {% if site.data.contact.email and site.data.contact.email != '' %}<a class="arrow-link" href="mailto:{{ site.data.contact.email | escape }}">Email <span aria-hidden="true">↗</span></a>{% endif %}
    </div>
  </div>
  <figure class="portrait-study" data-enter style="--delay: 160ms">
    <div class="portrait-frame"><img src="{{ '/assets/img/haoran-xu-original.jpg' | relative_url }}" width="1706" height="1279" alt="Haoran Xu outdoors beside a lake" fetchpriority="high"></div>
  </figure>
</section>

<section class="inquiry-preview section-rule" data-reveal>
  <div class="section-margin"><p class="eyebrow">Research</p><span class="margin-symbol" aria-hidden="true">∴</span></div>
  <div class="inquiry-content">
    <h2 class="section-heading">Looking closely.<br><em>Thinking differently.</em></h2>
    <div class="inquiry-pair">
      <a href="{{ '/research/' | relative_url }}#understanding" class="inquiry-link"><span class="micro-label">Understanding learning</span><p>The mechanisms, behaviors, and limits of existing systems.</p><span class="small-arrow" aria-hidden="true">↗</span></a>
      <a href="{{ '/research/' | relative_url }}#designing" class="inquiry-link"><span class="micro-label">Designing learning</span><p>New algorithms and ways of organizing computation and knowledge.</p><span class="small-arrow" aria-hidden="true">↗</span></a>
    </div>
    <a class="arrow-link research-experience-link" href="{{ '/research/' | relative_url }}#experience">Research Experience <span aria-hidden="true">&#8599;</span></a>
  </div>
</section>

<section class="reflection-preview section-rule" data-reveal>
  <p class="eyebrow">Beyond research</p>
  <h2>Room for a little<br><em>reflection.</em></h2>
  <div><p>Personal essays on ambition, time, and life.</p><a class="arrow-link" href="{{ '/reflections/' | relative_url }}">Read essays <span aria-hidden="true">↗</span></a></div>
</section>
