---
layout: editorial
title: CV
permalink: /cv/
editorial_section: cv
nav: true
nav_order: 4
---

<section class="research-intro">
  <p class="eyebrow" data-enter>04 / Academic CV</p>
  <h1 class="editorial-title" data-enter style="--delay: 80ms">A record of<br><em>research &amp; learning.</em></h1>
  <div class="about-links" data-enter style="--delay: 230ms">
    <a class="arrow-link" href="{{ site.data.contact.cv_path | relative_url }}" download="Haoran_Xu_Academic_CV.pdf" type="application/pdf">Download Academic CV <span aria-hidden="true">&#8595;</span></a>
    <a class="arrow-link" href="{{ site.data.contact.cv_path | relative_url }}" type="application/pdf">View PDF <span aria-hidden="true">&#8599;</span></a>
    <a class="arrow-link" href="{{ '/research/' | relative_url }}">Research experience <span aria-hidden="true">&#8599;</span></a>
    {% if site.data.contact.email and site.data.contact.email != '' %}<a class="arrow-link" href="mailto:{{ site.data.contact.email | escape }}">Email <span aria-hidden="true">&#8599;</span></a>{% endif %}
    {% if site.data.contact.institutional_email and site.data.contact.institutional_email != '' %}<a class="arrow-link" href="mailto:{{ site.data.contact.institutional_email | escape }}">ZJU Email <span aria-hidden="true">&#8599;</span></a>{% endif %}
  </div>
</section>
