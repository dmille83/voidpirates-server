(function() {
    function ClientSprite(url, size, frames, index) {
        this.size = size;
        this.frames = frames;
        this._index = 0;
        this.url = url;
        this.dir = 'horizontal';
        this._index = index;
    };

    ClientSprite.prototype = {
        render: function(ctx) {
            var max = this.frames.length;
            var idx = Math.floor(this._index);
            var frame = this.frames[idx % max];
            var x = 0;
            var y = 0;

            if(this.dir == 'vertical') {
                y += frame * this.size[1];
            }
            else {
                x += frame * this.size[0];
            }

            ctx.drawImage(resources.get(this.url),
                          x, y,
                          this.size[0], this.size[1],
                          0, 0,
                          this.size[0], this.size[1]);
        },

        getCopy: function() {
            return new ClientSprite(this.url, this.size, this.frames, this._index);
        }
    };

    // Register the list of functions and variables we want to make publicly available
    //module.exports = {
    //	ClientSprite: ClientSprite,
    //};

    if (typeof thisIsTheClient === "undefined")
    {
        // Register the list of functions and variables we want to make publicly available
        module.exports = {
            ClientSprite: ClientSprite,
        };
    }
    else
    {
        window.ClientSprite = ClientSprite;
    }
})();
