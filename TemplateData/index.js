/* #region Constants */

const AD_DISPLAY_DURATION = 5000;

/* #endregion */



class SWAGSDK 
{
    unityInstance = null;
    
    constructor ()
    {
        window.addEventListener('message', (event) => {
            if (
                event.origin.startsWith('http://localhost') ||
                event.origin.startsWith('https://localhost') ||
                event.origin.startsWith('http://local.addictinggames.com') ||
                event.origin.startsWith('https://local.addictinggames.com') ||
                event.origin.startsWith('https://new.addictinggames.com') ||
                event.origin.startsWith('https://www.addictinggames.com') ||
                event.origin.startsWith('https://addictinggames.com') ||
                event.origin.startsWith('http://local.shockwave.com') || 
                event.origin.startsWith('https://local.shockwave.com') || 
                event.origin.startsWith('https://new.shockwave.com') || 
                event.origin.startsWith('https://www.shockwave.com') ||
                event.origin.startsWith('https://shockwave.com') 
            ) {
                this.ReceiveMessage(event.data);
            };
        });
    }

    
    
    /* #region Website Interop */
    
    SendMessage (eventName, message)
    {
        window.parent.postMessage(JSON.stringify({ eventName, message }), '*');
    }
    
    ReceiveMessage (payload) 
    {
        const { eventName, message } = JSON.parse(payload);
        
        switch (eventName) {
            case 'onTokenReceived': {
                this.unityInstance.SendMessage('SWAG', 'OnTokenReceived', message);
                return;
            }
            case 'onTokenError': {
                this.unityInstance.SendMessage('SWAG', 'OnTokenError', message);
                return;
            }
        }
        
        throw new Error('Unknown event name: ' + eventName);
    }

    ShowBrandingAnimation (videoUrl) 
    {
        const containerEl = document.createElement('div');
        containerEl.classList.add('SWAGBrandingAnimation');

        const videoEl = document.createElement('video');
        videoEl.src = videoUrl;
        videoEl.autoplay = true;
        videoEl.loop = false;
        videoEl.muted = false;
        videoEl.controls = false;

        videoEl.addEventListener('ended', () => {
            this.unityInstance.SendMessage('SWAG', 'OnBrandingAnimationComplete');

            document.body.removeChild(containerEl);
        });

        containerEl.appendChild(videoEl);
        document.body.appendChild(containerEl);
    }
    
    /* #endregion */
    
    
    
    /* #region Ads */
    
    isAdCurrentlyShowing = false;
    
    BeginAd () 
    {
        return new Promise((resolve, reject) => {
            if (this.isAdCurrentlyShowing) {
                return reject('Ad is already being displayed.');
            }
    
            if (window.decoyScriptLoaded === undefined) {
                return resolve();
            }

            this.isAdCurrentlyShowing = true;
            
            // Create ad container
            const adElId = `swag-ad-${Math.floor(Math.random() * 1000000)}`;
            const adEl = document.createElement('div');
            adEl.classList.add('SWAGAd');
            adEl.setAttribute('id', adElId);
            
            // Insert the element into the DOM
            const containerEl = document.getElementById('swag-ad-container');
            containerEl.innerHTML = '';
            containerEl.appendChild(adEl);
            containerEl.style.display = 'flex';

            // Setup event handlers
            let clickHandler;
            
            const done = () => {
                this.isAdCurrentlyShowing = false;
                if (clickHandler) adEl.removeEventListener('click', clickHandler);
                containerEl.innerHTML = '';
                containerEl.style.display = 'none';
                resolve();
            };
            
            clickHandler = () => done();
            adEl.addEventListener('click', clickHandler);
            
            // Show the ad
            AdHelper.showAd(adElId, AD_DISPLAY_DURATION)
                .then(() => done())
                .catch((err) => reject(err));
        })
    }
    
    /* #endregion */
    
    
    
    /* #region Banners */
    
    GetBannerID (id)
    {
        return `swag-banner-${id}`;
    }
    
    GetBannerElement (id)
    {
        return document.getElementById(this.GetBannerID(id));
    }
    
    SetBannerPosition (el, x, y)
    {
        el.style.left = x + 'px';
        el.style.bottom = y + 'px';
    } 
    
    ShowBanner (id, x, y, pivot, bannerSize)
    {
        return new Promise((resolve, reject) => {
            if (this.GetBannerElement(id)) {
                return reject('Banner with that ID already exists.');
            }
    
            if (window.decoyScriptLoaded === undefined) {
                return reject('AdBlocker detected.');
            }
            
            // Create banner container
            const bannerEl = document.createElement('div');
            bannerEl.setAttribute('id', this.GetBannerID(id));
            bannerEl.classList.add('SWAGBanner');
            bannerEl.classList.add(`--size-${bannerSize}`);
            bannerEl.classList.add(`--pivot-${pivot}`);
            this.SetBannerPosition(bannerEl, x, y);
            
            // Inject the ad into the container
            bannerEl.innerHTML = AdHelper.makeBannerMarkup(bannerSize);
            
            // Insert the element into the DOM
            const containerEl = document.getElementById('swag-banner-container');
            containerEl.appendChild(bannerEl);
            
            resolve();
        })
    }
    
    PositionBanner (id, x, y)
    {
        return new Promise((resolve, reject) => {
            if (!this.GetBannerElement(id)) return reject(`Banner with ID '${id}' does not exist.`);
            
            const bannerEl = this.GetBannerElement(id);
            this.SetBannerPosition(bannerEl, x, y);
            
            resolve();
        });
    }
    
    HideBanner (id)
    {
        return new Promise((resolve, reject) => {
            if (!this.GetBannerElement(id)) return reject(`Banner with ID '${id}' does not exist.`);
            
            const bannerEl = this.GetBannerElement(id);
            bannerEl.remove();
            
            resolve();
        });
    }
    
    /* #endregion */
}

window.SWAGSDK = new SWAGSDK();
