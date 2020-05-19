module.exports = () => `/* use-typed-stream-elements */

videostream, screenstream {
 float: left;
}

videostream:first-child:nth-last-of-type(1) {
 width: 100%;
 height: 100%;
}
videostream:first-child:nth-last-of-type(2),
videostream:first-child:nth-last-of-type(2) ~ videostream {
 width: 50%;
 height: 100%;
}
videostream:first-child:nth-last-of-type(3),
videostream:first-child:nth-last-of-type(3) ~ videostream,
videostream:first-child:nth-last-of-type(4),
videostream:first-child:nth-last-of-type(4) ~ videostream {
 width: 50%;
 height: 50%;
}
videostream:first-child:nth-last-of-type(5),
videostream:first-child:nth-last-of-type(5) ~ videostream,
videostream:first-child:nth-last-of-type(6),
videostream:first-child:nth-last-of-type(6) ~ videostream,
videostream:first-child:nth-last-of-type(7),
videostream:first-child:nth-last-of-type(7) ~ videostream,
videostream:first-child:nth-last-of-type(8),
videostream:first-child:nth-last-of-type(8) ~ videostream,
videostream:first-child:nth-last-of-type(9),
videostream:first-child:nth-last-of-type(9) ~ videostream {
 width: 33%;
 height: 33%;
}
videostream:first-child:nth-last-of-type(10),
videostream:first-child:nth-last-of-type(10) ~ videostream,
videostream:first-child:nth-last-of-type(11),
videostream:first-child:nth-last-of-type(11) ~ videostream,
videostream:first-child:nth-last-of-type(12),
videostream:first-child:nth-last-of-type(12) ~ videostream,
videostream:first-child:nth-last-of-type(13),
videostream:first-child:nth-last-of-type(13) ~ videostream,
videostream:first-child:nth-last-of-type(14),
videostream:first-child:nth-last-of-type(14) ~ videostream,
videostream:first-child:nth-last-of-type(15),
videostream:first-child:nth-last-of-type(15) ~ videostream,
videostream:first-child:nth-last-of-type(16),
videostream:first-child:nth-last-of-type(16) ~ videostream {
 width: 25%;
 height: 25%;
}

screenstream:first-child:nth-last-of-type(1) {
 width: 100%;
 height: 100%;
}
screenstream:first-child:nth-last-of-type(2),
screenstream:first-child:nth-last-of-type(2) ~ screenstream {
 width: 50%;
 height: 100%;
}
screenstream:first-child:nth-last-of-type(3),
screenstream:first-child:nth-last-of-type(3) ~ screenstream,
screenstream:first-child:nth-last-of-type(4),
screenstream:first-child:nth-last-of-type(4) ~ screenstream {
 width: 50%;
 height: 50%;
}
screenstream:first-child:nth-last-of-type(5),
screenstream:first-child:nth-last-of-type(5) ~ screenstream,
screenstream:first-child:nth-last-of-type(6),
screenstream:first-child:nth-last-of-type(6) ~ screenstream,
screenstream:first-child:nth-last-of-type(7),
screenstream:first-child:nth-last-of-type(7) ~ screenstream,
screenstream:first-child:nth-last-of-type(8),
screenstream:first-child:nth-last-of-type(8) ~ screenstream,
screenstream:first-child:nth-last-of-type(9),
screenstream:first-child:nth-last-of-type(9) ~ screenstream {
 width: 33%;
 height: 33%;
}
screenstream:first-child:nth-last-of-type(10),
screenstream:first-child:nth-last-of-type(10) ~ screenstream,
screenstream:first-child:nth-last-of-type(11),
screenstream:first-child:nth-last-of-type(11) ~ screenstream,
screenstream:first-child:nth-last-of-type(12),
screenstream:first-child:nth-last-of-type(12) ~ screenstream,
screenstream:first-child:nth-last-of-type(13),
screenstream:first-child:nth-last-of-type(13) ~ screenstream,
screenstream:first-child:nth-last-of-type(14),
screenstream:first-child:nth-last-of-type(14) ~ screenstream,
screenstream:first-child:nth-last-of-type(15),
screenstream:first-child:nth-last-of-type(15) ~ screenstream,
screenstream:first-child:nth-last-of-type(16),
screenstream:first-child:nth-last-of-type(16) ~ screenstream {
 width: 25%;
 height: 25%;
}`;
