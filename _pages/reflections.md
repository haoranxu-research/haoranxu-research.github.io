---
layout: editorial
title: Reflections
permalink: /reflections/
editorial_section: reflections
nav: true
nav_order: 2
---

<section class="reflections-intro">
  <p class="eyebrow" data-enter>03 / Reflections</p>
  <h1 class="editorial-title" data-enter style="--delay: 80ms">Room for a little<br><em>reflection.</em></h1>
  <p class="page-deck" data-enter style="--delay: 160ms">Personal essays, and questions worth returning to.</p>
</section>

<section class="essay-index" aria-label="Personal essays">
  {% assign essays = site.reflections | sort: 'order' %}
  {% for essay in essays %}
    <a class="essay-index-entry" href="{{ essay.url | relative_url }}">
      <span class="essay-index-number">{% if forloop.index < 10 %}0{% endif %}{{ forloop.index }}</span>
      <div class="essay-index-copy">
        <h2>{{ essay.title_en }}</h2>
        <p class="essay-index-title-zh" lang="zh-Hans">{{ essay.title_zh }}</p>
        <p class="essay-index-excerpt">{{ essay.excerpt_en }}</p>
        <span class="essay-index-languages">English / <span lang="zh-Hans">中文</span></span>
      </div>
      <span class="essay-index-arrow" aria-hidden="true">↗</span>
    </a>
  {% endfor %}
</section>
