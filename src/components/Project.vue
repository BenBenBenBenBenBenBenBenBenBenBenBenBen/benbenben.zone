<template>
  <div class="project" :style="{ pointerEvents: isSafari ? 'none' : 'auto', cursor: open ? 'auto' : 'pointer' }">
    <div :class="generateClasses('project__container')">
      <div :class="generateClasses('project__client-type')" v-on:click="closeSelf">
        <span class="project__client">{{project.client}}</span><br />
        <span class="project__type">{{project.type}}</span>
      </div>
      <div :class="generateClasses('project__info-media')">
        <div :class="generateClasses('project__info')" ref="info">
          <div :class="generateClasses('project__info-toggle')" v-on:click="toggleInfoDescription">
            {{infoOpen ? '-' : '+'}} INFO
          </div>
          <div :class="Object.assign(generateClasses('project__info-description'), { 'project__info-description--open': infoOpen })" ref="infoDescription">
            <div v-html="description"></div>
            <br />
            <div class="project__info-role">ROLE: {{roles}}</div>
          </div>
        </div>
        <div :class="generateClasses('project__media')" :style="{ transform: mediaTransform, transitionDelay: infoOpen ? '0s' : '0.3s' }">
          <swiper :options="getSwiperOptions()" ref="mediaSlider">
            <swiper-slide v-for="mediaObj in resizedMedia" :key="mediaObj.media.url">
              <!-- <div class="project__media-image-container" :class="position === 'top' ? 'project__media-image-container--top' : 'project__media-image-container--bottom'"> -->
                <img v-if="mediaObj.media.mime.indexOf('image') === 0" class="project__media-image" v-lazy="mediaObj.media.url" />
                <video v-if="mediaObj.media.mime === 'video/mp4'" class="project__media-image" :src="mediaObj.media.url" autoplay loop muted />
              <!-- </div> -->
            </swiper-slide>
          </swiper>
        </div>
      </div>
    </div>
    
    <a v-if="project.link" :href="project.link" target="_blank" :class="generateClasses('project__link')">
      VISIT
    </a>
  </div>
</template>

<script>
import config from '../api/config'
import 'swiper/dist/css/swiper.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import MarkdownIt from 'markdown-it'

export default {
  name: 'Project',
  data () {
    return {
      infoOpen: false,
      mediaTransform: 'transformY(0)'
    }
  },
  props: {
    position: String,
    project: Object,
    open: Boolean,
    clickable: Boolean
  },
  components: {
    swiper,
    swiperSlide
  },
  mounted () {
    if (this.$refs.infoDescription) {
      this.mediaTransform = this.getMediaTransform()
    }
  },
  computed: {
    resizedMedia () {
      if (this.project.media) {
        const computed = this.project.media.map((mediaObj) => {
          const newMediaObj = Object.assign({}, mediaObj)
          if (mediaObj.media && mediaObj.media.mime === 'image/png') {
            const splitUrl = mediaObj.media.url.split('/upload/')
            const resizedUrl = splitUrl[0] + '/upload' + config.cloudinaryTransformation + splitUrl[1]
            newMediaObj.media.url = resizedUrl
          } else if (!mediaObj.media) {
            newMediaObj.media = { url: '' }
          }
          return newMediaObj
        })

        return computed
      }

      return []
    },
    isSafari () {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    },
    onTop () {
      return this.position === 'top'
    },
    onBottom () {
      return this.position === 'bottom'
    },
    description () {
      if (this.project.description) {
        const md = new MarkdownIt()
        return md.render(this.project.description)
      }

      return ''
    },
    roles () {
      let currentRoles = ''
      if (this.project.role) {
        currentRoles = Object.entries(this.project.role).filter(([role, active]) => { return active === true }).map(([role, active]) => {
          return role
        }).join(', ')
      }

      return currentRoles
    }
  },
  watch: {
    open (newVal, oldVal) {
      if (newVal === true) {
        this.$refs.mediaSlider.swiper.update()
      } else {
        this.closeInfoDescription() // Close description if we're closed
      }
    }
  },
  methods: {
    toggleInfoDescription () {
      if (this.open) {
        this.infoOpen = !this.infoOpen
        this.mediaTransform = this.getMediaTransform()
        if (this.infoOpen) {
          // This could be calculated earlier if we really wanted to. Info doesn't have to be open to get this right
          const infoDistFromProjectTop = this.$refs.info.getBoundingClientRect().top - this.$el.getBoundingClientRect().top
          const infoHeight = this.$refs.info.clientHeight
          const projectTotalHeight = infoHeight + infoDistFromProjectTop
          this.$emit('project-info-opened', projectTotalHeight)
        } else {
          this.$emit('project-info-opened', 0)
        }
      }
    },
    openInfoDescription () {
      this.infoOpen = true
      this.mediaTransform = this.getMediaTransform()
    },
    closeInfoDescription () {
      this.infoOpen = false
      this.mediaTransform = this.getMediaTransform()
    },
    getMediaTransform () {
      if (!this.infoOpen && this.$refs.infoDescription) {
        if (this.position === 'top') {
          return `translateY(-${this.$refs.infoDescription.clientHeight}px)`
        } else {
          return `translateY(${this.$refs.infoDescription.clientHeight}px)`
        }
      } else {
        return 'translateY(0)'
      }
    },
    getSwiperOptions () {
      return {
        slidesPerView: 'auto',
        centeredSlides: true,
        autoplay: this.isSafari,
        freeMode: !this.isSafari,
        freeModeSticky: true,
        mousewheel: true,
        spaceBetween: 30
      }
    },
    generateClasses (baseClass) {
      const classes = {}
      classes[baseClass] = true
      classes[baseClass + '--open'] = this.open
      classes[baseClass + '--closed'] = !this.open
      classes[baseClass + '--top'] = this.onTop
      classes[baseClass + '--bottom'] = this.onBottom

      return classes
    },
    closeSelf (event) {
      if (this.open) {
        this.$emit('project-collapse-click')
        event.stopPropagation()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.project__media {
  &--top {
    .swiper-wrapper {
      align-items: flex-start;
    }
  }

  &--bottom {
    .swiper-wrapper {
      align-items: flex-end;
    }
  }

  .swiper-slide {
    width: auto;
    max-width: 100%;
  }
}
.project__info-description {
  line-height: 1.5;

  a {
    text-decoration: underline;

    color: $white;

    font-weight: bold;
  }
}
</style>
<style scoped lang="scss">
.project {

  &__container {
    position: absolute;
    width: 100%;
    height: 100%;

    display: flex;

    top: 0;
    left: 0;

    &--top {
      flex-direction: column;
    }

    &--bottom {
      flex-direction: column-reverse;
    }
  }

  &__client-type {
    position: relative;

    width: 100%;

    font-size: $s-secondary-header-size;
    line-height: 1.25;

    $margin: 1.5rem;

    @media screen and (max-width: $small-screen-size) {
      width: 50%;

      font-size: $s-secondary-header-size-mobile;
    }

    &--top {
      top: 0;
      right: 0;

      padding: $margin $margin 0 0;

      text-align: right;
      align-self: flex-end;
    }

    &--bottom {
      bottom: 0;
      left: 0;

      padding: 0 0 $margin $margin;

      text-align: left;
      align-self: flex-start;
    }

    &--open {
      pointer-events: auto;
      cursor: pointer;
    }
  }

  &__client {
    text-transform: uppercase;
  }

  &__type {
    text-transform: lowercase;
  }

  &__link {
    position: absolute;
    z-index: 5;

    pointer-events: auto;

    color: $white;

    font-size: $s-secondary-header-size;
    font-style: italic;

    @media screen and (max-width: $small-screen-size) {
      font-size: $s-secondary-header-size-mobile;
    }

    &--top {
      right: 1.5rem;
      bottom: 3rem;

      @media screen and (max-width: $x-small-screen-size) and (max-aspect-ratio: 4/5) {
        bottom: 5rem;
      }
    }

    &--bottom {
      top: 3rem;
      left: 1.5rem;

      @media screen and (max-width: $x-small-screen-size) and (max-aspect-ratio: 4/5) {
        top: 5rem;
      }
    }
  }

  &__info-media {
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 50%;

    transition: filter 0.3s;

    filter: brightness(1);

    &--closed {
      filter: brightness(0.25);
    }

    &--top {
      justify-content: flex-start;
    }

    &--bottom {
      justify-content: flex-end;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    padding: 1.5rem;

    font-family: $orpheus;
    font-size: $o-body-text-size;
    line-height: 1.25;

    &--top {
      order: 0;
    }

    &--bottom {
      order: 1;
    }
  }

  &__info-toggle {
    cursor: pointer;
    transition: opacity 0.3s $ease-in-quad;
    pointer-events: auto;

    font-family: $stratos;

    &--top {
      order: 0;

      margin-bottom: 1rem;

      text-align: right;
    }

    &--bottom {
      order: 1;

      margin-top: 1rem;
    }

    &--open {
      opacity: 1;
    }

    &--closed {
      opacity: 0;
    }
  }

  &__info-description {
    transition: opacity 0.3s $ease-in-quad;

    opacity: 0;

    &--top {
      order: 1;
    }

    &--bottom {
      order: 0;
    }
    
    &--open {
      transition: opacity 0.3s 0.3s $ease-in-quad;

      opacity: 1;
    }
    
    a {
      color: $white;
    }
  }

  &__info-role {
    text-align: right;
    text-transform: lowercase;

    font-family: $stratos;
    font-weight: bold;
  }

  &__media {
    z-index: 5;

    flex: 1;

    transition: transform 0.3s $ease-in-quad;
  }

  &__media-image {
    max-width: 100%;
    max-height: 300px;

    transition: all 0.3s;

    -webkit-user-drag: none;
  }
}
</style>
