var w, h, k, xo, yo, isGameOver, units = [],
    icons = [],
    bullets = [],
    enemies = [],
    explosions = [],
    dif = [" practice", " easy", " medium", " hard", " harder", " hardcore", " pro", " deathmatch", " godlike", " impossible"],
    gameTime = 0,
    nextwave = 0,
    enemydep = 1,
    firstwave = !1,
    deployarea = !1,
    counter = 0,
    counter2 = 0,
    gameNum = 0,
    game_paused = !1,
    lvl = 0,
    inf = function() {
        var e = document.getElementById("infdiv");
        document.getElementById("info");
        "block" !== e.style.display ? (e.style.display = "block", info.style.color = "white", info.style.backgroundColor = "red") : (e.style.display = "none", info.style.color = "red", info.style.backgroundColor = "#f3f3f3")
    },
    changeLvl = function(e) {
        1 == e && lvl < 9 && lvl++, 0 == e && lvl > 0 && lvl--, document.getElementsByClassName("dif")[1].innerHTML = dif[lvl]
    };
! function() {
    function e(e, t, i, n, s, o, a, r) {
        this.pos = t, this.size = i, this.resized = n, this.url = e, this.animspeed = s, this.frames = o, this._index = a, this.once = r
    }
    e.prototype = {
        update: function(e) {
            this._index += this.animspeed * e
        },
        render: function(e) {
            var t;
            if (this.animspeed > 0) {
                var i = this.frames.length,
                    n = Math.floor(this._index);
                if (t = this.frames[n % i], this.once && n >= i) return void(this.done = !0)
            } else t = 0;
            var s = this.pos[0],
                o = this.pos[1];
            s += t * this.size[0], e.drawImage(resources.get(this.url), s, o, this.size[0], this.size[1], 0, 0, this.resized[0], this.resized[1])
        }
    }, window.Sprite = e
}(),
function() {
    function e(e, t, i, n, s, o, a, r, h, l, d, p) {
        this.status = e, this.pos = t, this.hp = i, this.maxhp = i, this.speed = n, this.maxspeed = s, this.range = o, this.damage = a, this.reload = r, this.angle = h, this.defaultangle = l, this.dir = d, this.sprite = p
    }
    e.prototype = {
        getAngle: function(e) {
            var t = this.pos[0] - e[0],
                i = this.pos[1] - e[1];
            return t < 0 ? Math.floor(Math.atan(i / t) * (180 / Math.PI)) : Math.floor(Math.atan(i / t) * (180 / Math.PI) - 180)
        },
        moveAhead: function(e) {
            var t = this.angle / (180 / Math.PI);
            this.pos[0] += Math.cos(t) * this.speed * e * this.dir, this.pos[1] += Math.sin(t) * this.speed * e * this.dir
        },
        findTarget: function(e) {
            for (i = 0; i < e.length; i++) {
                if (this.getDistance(e[i]) < this.range && !e[i].destroyed && e[i].time > .7 && e[i].pos[1] > k) return this.target = e[i], void(this.status = "targetfound")
            }
        },
        avoidCollision: function(e, t, n) {
            var s = e;
            for (i = 0; i < s.length; i++)
                if (i != t && this.getDistance(s[i]) < 8 * k)
                    for (var o = 2; o > 0; o--) {
                        var a = [this.pos[0] + Math.cos(this.angle / (180 / Math.PI)) * this.speed * o * this.dir, this.pos[1] + Math.sin(this.angle / (180 / Math.PI)) * this.speed * o * this.dir],
                            r = [s[i].pos[0] + Math.cos(s[i].angle / (180 / Math.PI)) * s[i].speed * o * this.dir, s[i].pos[1] + Math.sin(s[i].angle / (180 / Math.PI)) * s[i].speed * o * this.dir];
                        getDistance(a, r) < 3 * k && this.pos[1] * this.dir > s[i].pos[1] * s[i].dir && Math.abs(a[0] - r[0]) < this.sprite.resized[0] && (this.speed -= 160 / Math.pow(o, 4) * n)
                    }
        },
        getDistance: function(e) {
            return Math.floor(Math.sqrt(Math.pow(this.pos[0] - e.pos[0], 2) + Math.pow(this.pos[1] - e.pos[1], 2)))
        },
        fireOnTarget: function() {
            var e = Math.floor(this.pos[0] + this.sprite.resized[1] / 2 * this.dir * Math.cos(this.angle / (180 / Math.PI))),
                t = Math.floor(this.pos[1] + this.sprite.resized[0] / 2 * this.dir * Math.sin(this.angle / (180 / Math.PI)));
            bullets.push({
                pos: [e, t],
                target: this.target,
                speed: 12 * k,
                damage: this.damage,
                angle: this.angle + getRandom(-5, 3),
                dir: this.dir
            }), this.lastshot = 0
        }
    }, window.Unit = e
}();
var getRandom = function(e, t) {
        return Math.floor(Math.random() * (t - e + 1)) + e
    },
    getDistance = function(e, t) {
        return Math.floor(Math.sqrt(Math.pow(e[0] - t[0], 2) + Math.pow(e[1] - t[1], 2)))
    },
    deployUnit = function(e, t) {
        var i = e;
        units.push(new Unit(i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], i[8], i[9], i[10], i[11], i[12], i[13])), units[units.length - 1].pos = t, deployarea = !1
    },
    deployEnemy = function(e, t) {
        var i = e;
        enemies.push(new Unit(i[0], i[1], i[2], i[3], i[4], i[5], i[6], i[7], i[8], i[9], i[10], i[11], i[12], i[13])), enemies[enemies.length - 1].pos = t
    },
    returnToBase = function(e) {
        e.pos = e.defaultpos, e.dragable = !1
    },
    gameOver = function(e) {
        var t = Math.floor(gameTime / 60),
            i = ("0" + Math.floor(gameTime % 60)).slice(-2);
        switch (e) {
            case "win":
                alert("Mission completed! Your time is " + t + ":" + i + "\n\nLosses: " + counter + " units.\n\nEnemies destroyed: " + counter2 + ".");
                var n = "<p>Game " + ++gameNum + ": 🏆 Win ⏲" + t + ":" + i + " /" + dif[lvl] + " /</p>";
                lvl < dif.length - 1 && lvl++, (s = document.getElementById("log")).innerHTML += n, document.body.style.paddingTop = 50 - 3 * gameNum + "%", s.style.display = "block", loader();
                break;
            case "loss":
                alert("Mission failed!\n\nLosses: " + counter + " units.\n\nEnemies destroyed: " + counter2 + ".");
                var s;
                n = "<p>Game " + ++gameNum + ": 💩 Fail ⏲" + t + ":" + i + " /" + dif[lvl] + " /</p>";
                lvl > 0 && lvl--, (s = document.getElementById("log")).innerHTML += n, document.body.style.paddingTop = 50 - 3 * gameNum + "%", s.style.display = "block", loader()
        }
    },
    reset = function() {
        units = [], icons = [], bullets = [], enemies = [], explosions = [], isGameOver = !1, gameTime = 0, enemydep = 1, firstwave = !1, nextwave = 0, deployarea = !1, counter = 0, counter2 = 0
    },
    xxx = 0,
    yyy = 0,
    mouse = {
        x: 0,
        y: 0,
        down: !1
    },
    startGame = function() {
        reset();
        var e = document.getElementById("myModal"),
            t = document.getElementsByClassName("close")[0],
            n = document.getElementsByClassName("modal-text")[0];
        t.onclick = function() {
            e.style.display = "none", game_paused = !game_paused
        };
        var s = document.getElementById("log"),
            o = document.getElementById("infdiv");
        s.style.display = "none", o.style.display = "none", document.body.style.paddingTop = 0, document.getElementById("main").innerHTML = '<canvas id="c"></canvas>';
        var a = document.getElementById("c"),
            r = a.getContext("2d");

        function l(t, i) {
            t > icons[0].pos[0] && t < icons[0].pos[0] + 5 * k && i > icons[0].pos[1] - 3 * k && i < icons[0].pos[1] + 3 * k && !icons[0].respawn && !game_paused && (icons[1].dragable || icons[2].dragable || (icons[0].dragable = !0, p[0] = "readyfordeploy", deployarea = !0)), t > icons[1].pos[0] && t < icons[1].pos[0] + 5 * k && i > icons[1].pos[1] - 3 * k && i < icons[1].pos[1] + 3 * k && !icons[1].respawn && !game_paused && (icons[0].dragable || icons[2].dragable || (icons[1].dragable = !0, g[0] = "readyfordeploy", deployarea = !0)), t > icons[2].pos[0] && t < icons[2].pos[0] + 5 * k && i > icons[2].pos[1] - 3 * k && i < icons[2].pos[1] + 3 * k && !icons[2].respawn && !game_paused && (icons[0].dragable || icons[1].dragable || (icons[2].dragable = !0, c[0] = "readyfordeploy", deployarea = !0)), t > icons[3].pos[0] && t < icons[3].pos[0] + 5 * k && i > icons[3].pos[1] - 3 * k && i < icons[3].pos[1] + 3 * k && (game_paused = !game_paused, "block" == e.style.display ? e.style.display = "none" : (n.innerHTML = "Please, donate 5 bucks at my Buy Me Coffee page at start to obtain this fabulous, innovative, wirelessly rechargeable, eco/vegan/gay friendly machine of death!🤩 <br/>Thank you!", e.style.width = .8 * a.width + "px", e.style.marginLeft = .1 * a.width + xo + "px", e.style.display = "block"))
        }

        function d(e, t) {
            var i = !1;
            e > a.width / 100 && t > a.height / 2 && e < a.width - a.width / 100 - 3 && t < a.height / 2 + a.height / 3.7 && (i = !0);
            for (var n = !1, s = 0; s < units.length; s++) getDistance([e, t], units[s].pos) < 2 * k && (n = !0);
            "readyfordeploy" == p[0] && i && !n ? (p[0] = " ", deployUnit(p, [e, t]), units[units.length - 1].status = "acceleration", icons[0].pos = [icons[0].defaultpos[0], icons[0].defaultpos[1] + a.width / 4], icons[0].dragable = !1, icons[0].respawn = !0, deployarea = !1) : "readyfordeploy" != p[0] || (i || icons[0].respawn) && !n || (returnToBase(icons[0]), p[0] = " "), "readyfordeploy" == g[0] && i && !n ? (g[0] = " ", deployUnit(g, [e, t]), units[units.length - 1].status = "acceleration", icons[1].pos = [icons[1].defaultpos[0], icons[1].defaultpos[1] + a.width / 4], icons[1].dragable = !1, icons[1].respawn = !0) : "readyfordeploy" != g[0] || (i || icons[1].respawn) && !n || (returnToBase(icons[1]), g[0] = " "), "readyfordeploy" == c[0] && i && !n ? (c[0] = " ", deployUnit(c, [e, t]), units[units.length - 1].status = "acceleration", icons[2].pos = [icons[2].defaultpos[0], icons[2].defaultpos[1] + a.width / 4], icons[2].dragable = !1, icons[2].respawn = !0) : "readyfordeploy" != c[0] || (i || icons[2].respawn) && !n || (returnToBase(icons[2]), c[0] = " ")
        }
        w = window.innerWidth, h = window.innerHeight, w < h ? (a.width = w - 46, a.height = a.width / .7) : (a.height = h - 46, a.width = .7 * a.height), k = a.width / 26, xo = a.offsetLeft, yo = a.offsetTop, icons = [{
            active: !0,
            pos: [a.width / 28, a.height - a.height / 8],
            defaultpos: [a.width / 28, a.height - a.height / 8],
            respawn: !1,
            respawnrate: 1,
            sprite: new Sprite("images/3.png", [55, 76], [194, 134], [a.width / 5.5, a.height / 10.5])
        }, {
            active: !0,
            pos: [a.width / 3.4, a.height - a.height / 8.5],
            defaultpos: [a.width / 3.4, a.height - a.height / 8.5],
            respawn: !1,
            respawnrate: 3,
            sprite: new Sprite("images/3.png", [71, 600], [159, 130], [a.width / 6.5, a.height / 12])
        }, {
            active: !0,
            pos: [a.width / 1.85, a.height - a.height / 8.2],
            defaultpos: [a.width / 1.85, a.height - a.height / 8.2],
            respawn: !1,
            respawnrate: .5,
            sprite: new Sprite("images/3.png", [52, 269], [205, 124], [a.width / 5.8, a.height / 12])
        }, {
            active: !1,
            pos: [a.width / 1.27, a.height - a.height / 8.2],
            defaultpos: [a.width / 1.27, a.height - a.height / 8.2],
            respawn: !1,
            respawnrate: .5,
            sprite: new Sprite("images/3.png", [68, 434], [162, 131], [a.width / 5.8, a.height / 12])
        }], a.addEventListener("touchmove", function(e) {
            var t = e.touches[0];
            xxx = t.pageX - xo - 3, yyy = t.pageY - yo - 3, l(xxx, yyy), e.preventDefault()
        }, !1), a.addEventListener("touchend", function(e) {
            d(xxx, yyy)
        }, !1), a.addEventListener("mousemove", function(e) {
            mouse.x = e.pageX - xo - 3, mouse.y = e.pageY - yo - 3
        }, !1), a.addEventListener("mousedown", function() {
            mouse.down = !0, l(mouse.x, mouse.y)
        }, !1), a.addEventListener("mouseup", function() {
            mouse.down = !1, d(mouse.x, mouse.y)
        }, !1), lastTime = Date.now();
        var p = ["acceleration", [0, 0], 1500, 0, 1.5 * k, 7 * k, 399, 1.3, -90, -90, 1, new Sprite("images/3.png", [55, 76], [194, 135], [a.width / 11, a.height / 21])],
            g = ["acceleration", [0, 0], 300, 0, 5.5 * k, 10 * k, 149, .9, -90, -90, 1, new Sprite("images/3.png", [71, 600], [159, 130], [a.width / 13, a.height / 24])],
            c = ["acceleration", [0, 0], 150, 0, 3.5 * k, 12.5 * k, 30, .05, -90, -90, 1, new Sprite("images/3.png", [52, 269], [205, 124], [a.width / 11.6, a.height / 24])],
            m = ["acceleration", [0, 0], 1500, 0, 1.5 * k, 7 * k, 399, 1.3, -90, -90, -1, new Sprite("images/3.png", [365, 76], [194, 135], [a.width / 11, a.height / 21])],
            u = ["acceleration", [200, 200], 300, 0, 5.5 * k, 10 * k, 149, .7, -90, -90, -1, new Sprite("images/3.png", [395, 600], [159, 130], [a.width / 13, a.height / 24])],
            f = ["acceleration", [0, 0], 150, 0, 3.5 * k, 12.5 * k, 10, .05, -90, -90, -1, new Sprite("images/3.png", [362, 269], [205, 124], [a.width / 11.6, a.height / 24])];

        function v(e, t) {
            for (var i = 0; i < t.length; i++) {
                var n, s = t[i];
                if (n = t == units ? enemies : units, s.time = s.time + e || 0, s.lastshot = s.lastshot + e || 0, s.avoidCollision(t, i, e), s.destroyed) t.splice(i, 1), i--, t == units ? counter++ : counter2++;
                else {
                    if (t == enemies && s.pos[1] > a.height - (a.width / 4 + 2 * k)) {
                        isGameOver = !0, gameOver("loss");
                        break
                    }
                    if (t == units && s.pos[1] < 2 * k) {
                        isGameOver = !0, gameOver("win");
                        break
                    }
                }
                if ("acceleration" == s.status && s.speed < s.maxspeed) switch (s.speed += 15 * e, t) {
                    case units:
                        s.angle < s.defaultangle ? s.angle += Math.floor(80 * e * s.dir) : s.angle > s.defaultangle && (s.angle -= Math.floor(80 * e * s.dir));
                        break;
                    case enemies:
                        s.cang = s.defaultangle, s.cang < -90 ? s.cang += 180 : s.cang > -90 && (s.cang -= 180), s.cang < s.angle ? s.angle -= Math.floor(75 * e) : s.cang > s.angle && (s.angle += Math.floor(75 * e))
                }
                s.time > 1 && !s.target && s.pos[1] > k && s.findTarget(n), s.target && s.target.destroyed ? (s.status = "acceleration", delete s.target) : "targetfound" != s.status || s.target.destroyed || (s.speed > 0 ? s.speed -= 2 * s.maxspeed * e : s.speed = 0, s.cang = Math.floor(s.getAngle(s.target.pos)), t == enemies && (s.cang < -90 ? s.cang += 180 : s.cang > -90 && (s.cang -= 180)), s.cang > s.angle && s.cang < s.angle + 3 ? s.angle = s.cang : s.cang > s.angle ? s.angle += Math.floor(150 * e) : s.cang < s.angle && s.cang > s.angle - 3 ? s.angle = s.cang : s.cang < s.angle && (s.angle -= Math.floor(150 * e)), s.lastshot > s.reload && Math.floor(s.angle) == Math.floor(s.cang) && s.getDistance(s.target) < s.range ? s.fireOnTarget() : s.findTarget(n)), s.time > .7 && s.speed > 0 && s.moveAhead(e)
            }
        }

        function b() {
            r.beginPath(), r.rect(a.width / 100 - 2, a.height / 2 - 2, a.width - a.width / 100 - 3 + 4, a.height / 3.7 + 4), r.strokeStyle = "darkgreen", r.closePath(), r.stroke(), r.beginPath(), r.rect(a.width / 100, a.height / 2, a.width - a.width / 100 - 3, a.height / 3.7), r.strokeStyle = "white", r.closePath(), r.stroke()
        }

        function M() {
            for (i = 0; i < icons.length; i++) 1 != icons[i].respawn && icons[i].active ? r.fillStyle = "green" : r.fillStyle = "red", r.fillRect(a.width / 4.8 + a.width / 4 * i, a.height - a.width / 4.1, a.width / 30, a.width / 30)
        }

        function E(e) {
            for (var t = 0; t < e.length; t++) x(e[t]);
            M(),
                function(e) {
                    for (var t = 0; t < e.length; t++) e[t].dragable ? (r.save(), mouse.down ? r.translate(mouse.x, mouse.y) : r.translate(xxx, yyy), r.rotate(Math.PI / 180 * -90), r.translate(-e[t].sprite.resized[0] / 2, -e[t].sprite.resized[1] / 2), e[t].sprite.render(r), e[t].pos = [xxx, yyy], r.restore()) : (r.save(), r.translate(e[t].pos[0] + e[t].sprite.resized[0] / 2, e[t].pos[1] + e[t].sprite.resized[1] / 2), r.rotate(Math.PI / 180 * -90), r.translate(-e[t].sprite.resized[0] / 2, -e[t].sprite.resized[1] / 2), e[t].active || (r.globalAlpha = .2), e[t].sprite.render(r), r.restore())
                }(icons)
        }

        function x(e) {
            e.destroyed || (r.save(), r.translate(e.pos[0], e.pos[1]), e.time && e.time < .7 && r.scale(1.9 - e.time * e.time * 1.7, 1.9 - e.time * e.time * 1.7), r.rotate(Math.PI / 180 * e.angle), r.translate(-e.sprite.resized[0] / 2, -e.sprite.resized[1] / 2), e.sprite.render(r), function(e) {
                if (e.time > .8) {
                    var t = 100 * e.hp / e.maxhp;
                    if (t < 0 && (t = 0), e.dir < 0) var i = e.sprite.resized[0];
                    else var i = 0;
                    r.beginPath(), r.lineWidth = k / 2.5, r.lineCap = "round", r.strokeStyle = "black", r.moveTo(0 + i, 0), r.lineTo(0 + i, e.sprite.resized[1]), r.stroke(), r.beginPath(), r.lineWidth = k / 3.2, r.lineCap = "round", r.strokeStyle = "lightgrey", r.moveTo(0 + i, 0), r.lineTo(0 + i, e.sprite.resized[1]), r.stroke(), r.beginPath(), r.lineWidth = k / 4, r.lineCap = "round", r.strokeStyle = "rgb(" + Math.floor(100 - 2.56 * t) + "," + Math.floor(2.56 * t) + ",0)", r.moveTo(0 + i, 0), r.lineTo(0 + i, t / 100 * e.sprite.resized[1]), r.stroke(), r.lineWidth = 1
                }
            }(e), r.restore())
        }! function e() {
            var t = Date.now();
            if (!game_paused) {
                var n = (t - lastTime) / 1e3;
                ! function(e) {
                    gameTime += e, nextwave < 0 ? nextwave = (enemydep * (18 - lvl) - gameTime + 2).toFixed(0) : nextwave -= e;
                    if (1 == Math.floor(gameTime) && 0 == firstwave) {
                        if (lvl < 3 && (lvl >= 0 && (deployEnemy(m, [a.width / 4, a.height / 5]), deployEnemy(m, [a.width - a.width / 4, a.height / 5])), lvl >= 1 && deployEnemy(f, [a.width / 2, a.height / 20]), lvl >= 2 && (deployEnemy(u, [a.width / 5, a.height / 18]), deployEnemy(u, [a.width - a.width / 5, a.height / 18]))), lvl > 2 && lvl < 6 && (lvl >= 3 && (deployEnemy(m, [a.width / 2, a.height / 4]), deployEnemy(u, [a.width / 2 - a.width / 16, a.height / 7]), deployEnemy(u, [a.width / 2 + a.width / 16, a.height / 7]), deployEnemy(f, [a.width / 2, a.height / 14]), deployEnemy(f, [a.width / 2 - a.width / 8, a.height / 14]), deployEnemy(f, [a.width / 2 + a.width / 8, a.height / 14]), 3 == lvl && (deployEnemy(f, [a.width / 2 - a.width / 4, a.height / 14]), deployEnemy(f, [a.width / 2 + a.width / 4, a.height / 14]))), lvl >= 4 && deployEnemy(u, [a.width / 8 - a.width / 11, -a.height / 4]), lvl >= 5 && deployEnemy(u, [a.width + a.width / 64, -a.height / 2])), lvl > 5 && lvl < 9 && (lvl >= 6 && (deployEnemy(m, [a.width / 2, a.height / 4]), deployEnemy(m, [a.width / 2 + a.width / 8, a.height / 4]), deployEnemy(m, [a.width / 2 - a.width / 8, a.height / 4]), deployEnemy(f, [a.width / 2, a.height / 7]), deployEnemy(f, [a.width / 2 - a.width / 8, a.height / 7]), deployEnemy(f, [a.width / 2 + a.width / 8, a.height / 7])), lvl >= 7 && (deployEnemy(u, [a.width / 8 - a.width / 11, a.height / 14]), deployEnemy(u, [a.width - (a.width / 8 - a.width / 11), a.height / 14])), lvl >= 8 && (deployEnemy(u, [a.width / 8 - a.width / 11, -a.height / 4]), deployEnemy(u, [a.width - (a.width / 8 - a.width / 11), -a.height / 4]))), 9 == lvl) {
                            for (var t = 0; t < 7; t++) setTimeout(deployEnemy, 50 * t, m, [a.width / 8 + t * (a.width / 8), a.height / 4]);
                            for (var t = 0; t < 6; t++) setTimeout(deployEnemy, 50 * t, u, [a.width / 8 + t * (a.width / 8) + a.width / 16, a.height / 7]);
                            for (var t = 0; t < 7; t++) setTimeout(deployEnemy, 50 * t, f, [a.width / 8 + t * (a.width / 8), a.height / 20])
                        }
                        firstwave = !0
                    }
                    Math.floor(gameTime) == enemydep * (18 - lvl % 17) && (deployEnemy(m, [getRandom(30, a.width - 30), getRandom(-20, -40)]), deployEnemy(u, [getRandom(30, a.width - 30), getRandom(-20, -40) - 2 * k]), deployEnemy(u, [getRandom(30, a.width - 30), getRandom(-20, -40) - 2 * k]), deployEnemy(f, [getRandom(30, a.width - 30), getRandom(-20, -40) - 4 * k]), deployEnemy(f, [getRandom(30, a.width - 30), getRandom(-20, -40) - 4 * k]), enemydep++);
                    v(e, units), v(e, enemies),
                        function(e) {
                            for (var t = 0; t < explosions.length; t++) explosions[t].sprite.update(e), explosions[t].sprite.done && (explosions.splice(t, 1), t--);
                            for (var t = 0; t < bullets.length; t++) {
                                var i = bullets[t],
                                    n = i.angle / (180 / Math.PI);
                                i.pos[0] += Math.cos(n) * i.speed * e * i.dir, i.pos[1] += Math.sin(n) * i.speed * e * i.dir, i.pos[1] < i.target.pos[1] + k && i.pos[1] > i.target.pos[1] - k && i.pos[0] < i.target.pos[0] + k && i.pos[0] > i.target.pos[0] - k && (bullets.splice(t, 1), t--, i.target.hp >= 0 && !i.target.destroyed && (i.target.hp -= i.damage), i.target.hp < 0 && (i.target.destroyed = !0, i.target.hp = 0, explosions.push({
                                    pos: i.target.pos,
                                    sprite: new Sprite("images/1.png", [0, 117], [39, 39], [3.2 * k, 3.2 * k], 14, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], null, !0)
                                })))
                            }
                        }(e),
                        function(e) {
                            for (i = 0; i < icons.length; i++) icons[i].pos[1] > icons[i].defaultpos[1] && 1 == icons[i].respawn ? icons[i].pos[1] -= icons[i].respawnrate * k * e : icons[i].respawn = !1
                        }(e)
                }(n), isGameOver || (function(e) {
                    for (e.globalAlpha = .5, t = 0; 102 * t < a.width; t++)
                        for (y = 0; 102 * y < a.height; y++) e.drawImage(resources.get("images/2.webp"), 0, 0, 512, 512, 102 * t, 102 * y, 102, 102);
                    e.globalAlpha = 1, e.fillStyle = "rgba(250,250,250,0.19)", e.fillRect(0, 0, a.width, a.height), e.fillStyle = "rgba(50,200,50,0.9)", e.fillRect(0, 0, a.width, a.height / 20), e.fillStyle = " rgba(200,50,50,0.7)", e.fillRect(0, a.height - a.width / 4 - a.height / 20, a.width, a.height / 20), e.font = a.height / 24 + "px Arial", e.fillStyle = " rgba(250,250,250,0.7)", e.fillText("NEXT WAVE IN " + Math.round(nextwave), a.width / 10, a.height / 22), e.beginPath();
                    for (var t = a.width / 4; t < a.width; t += a.width / 4) e.moveTo(t + .1, a.height - a.width / 4), e.lineTo(t + .1, a.height);
                    e.moveTo(0, a.height - a.width / 4), e.lineTo(a.width, a.height - a.width / 4), e.closePath(), e.strokeStyle = "#eee", e.stroke(), !0 === deployarea && b()
                }(r), E(enemies), E(units), function() {
                    for (var e = 0; e < bullets.length; e++) r.save(), r.fillStyle = "black", r.beginPath(), r.arc(bullets[e].pos[0], bullets[e].pos[1], 1 + bullets[e].damage / 300, 0, 2 * Math.PI), r.fill(), r.restore()
                }(), E(explosions))
            }
            lastTime = t;
            isGameOver || requestAnimFrame(e)
        }()
    },
    requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(e) {
        window.setTimeout(e, 1e3 / 60)
    };

function loader() {
    var e = document.getElementById("main");
    (lvl < 0 || lvl > 9) && (lvl = 0), e.innerHTML = '<button id="start" onclick="startGame ()">Start Game</button><button id="info" onclick="inf()">Info</button><br/><span class="dif">Difficulty:</span><br/><button id="btn-left" onclick="changeLvl(0)">&lt</button><span class="dif" >' + dif[lvl] + '  </span><button id="btn-right" onclick="changeLvl (1)" >&gt</button>', lastTime = Date.now()
}! function() {
    var e = {},
        t = [];

    function i(i) {
        if (e[i]) return e[i];
        var s = new Image;
        s.onload = function() {
            e[i] = s, n() && t.forEach(function(e) {
                e()
            })
        }, e[i] = !1, s.src = i
    }

    function n() {
        var t = !0;
        for (var i in e) e.hasOwnProperty(i) && !e[i] && (t = !1);
        return t
    }
    window.resources = {
        load: function(e) {
            e instanceof Array ? e.forEach(function(e) {
                i(e)
            }) : i(e)
        },
        get: function(t) {
            return e[t]
        },
        onReady: function(e) {
            t.push(e)
        },
        isReady: n
    }
}(), resources.load(["images/3.png", "images/1.png", "images/2.webp"]), resources.onReady(loader);
