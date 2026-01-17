---
layout: default
title: slides
---

<div class="gallery">
  {% for slide in site.slides %}
    <a href="{{ slide.url }}" class="gallery-item">
      <img src="/{{ slide.image }}" alt="{{ slide.alt | default: slide.title }}">
    </a>
  {% endfor %}
</div>