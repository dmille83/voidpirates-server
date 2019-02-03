(function() {
    function SunSprite(diameter) {
        this.diameter = diameter;
        this.size = [0, 0]
        this._index = 0;
    };

    SunSprite.prototype = {
        render: function(ctx) {
            var sunDiameter = this.diameter; //1548;

            // Layer 1
            ctx.beginPath();
            var innerRadius = sunDiameter*0.2, outerRadius = sunDiameter*1;
            var gradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius);
            ctx.fillStyle = gradient;
            gradient.addColorStop(0, 'rgba(31,31,31, 0.3)');
            gradient.addColorStop(1, 'rgba(31,31,31, 0.3)');
            ctx.arc(0, 0, outerRadius, 0, 2 * Math.PI);
            ctx.fill();


            // Layer 2
            ctx.beginPath();
            var innerR = sunDiameter * 0.52, outerR = sunDiameter * 0.6;
            //var innerR = sunDiameter * 0.5, outerR = sunDiameter * 0.58;
            var gradient2 = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR);
            ctx.fillStyle = gradient2;
            gradient2.addColorStop(0, 'white');
            gradient2.addColorStop(0.2, 'yellow');
            gradient2.addColorStop(1, 'transparent');
            ctx.arc(0, 0, outerR, 0, 2 * Math.PI);
            ctx.fill();
        },

        getCopy: function() {
            return new SunSprite(this.diameter);
        }
    };

    // Register the list of functions and variables we want to make publicly available
    //module.exports = {
    //	SunSprite: SunSprite,
    //};

    if (typeof thisIsTheClient === "undefined")
    {
        // Register the list of functions and variables we want to make publicly available
        module.exports = {
            SunSprite: SunSprite,
        };
    }
    else
    {
        window.SunSprite = SunSprite;
    }
})();
