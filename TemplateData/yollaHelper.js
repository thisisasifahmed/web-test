class AdHelper 
{
    static makeBannerMarkup (bannerSize)
    {
        let type;
        switch (bannerSize)
        {
            case '728x90':
                type = 'desktop-leaderboard-template';
                break;
            case '300x250':
                type = 'desktop-medrec-template';
                break;
            case '320x50':
                type = 'mobile-leaderboard-template';
                break;
        }

        let template = document.getElementById('swag-banner-template').innerHTML;
        template = template.replace('{type}', type);
        template = template.replace('{subtype}', bannerSize);

        return template;
    }

    static showAd (containerId, _duration) 
    {
        return new Promise ((resolve, reject) => {
            const YMPB = window.YMPB;
            
            if (YMPB !== undefined && window.decoyScriptLoaded) {
                try {
                    YMPB.preroll(containerId, resolve);
                } catch (err) {
                    reject(err.message);
                }
            } else {
                resolve();
            }
        });
    }
}
