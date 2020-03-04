module.exports = () => `stream[type="screen"]:first-child {
  position:absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 100;
 }
 
 stream[type="camera"] {
   float: left;
 }
 
 stream[type="camera"]:first-child:nth-last-child(1) {
   width: 100%;
   height: 100%;
 }
 stream[type="camera"]:first-child:nth-last-child(2),
 stream[type="camera"]:first-child:nth-last-child(2) ~ stream[type="camera"] {
   width: 50%;
   height: 100%;
 }
 stream[type="camera"]:first-child:nth-last-child(3),
 stream[type="camera"]:first-child:nth-last-child(3) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(4),
 stream[type="camera"]:first-child:nth-last-child(4) ~ stream[type="camera"] {
   width: 50%;
   height: 50%;
 }
 stream[type="camera"]:first-child:nth-last-child(5),
 stream[type="camera"]:first-child:nth-last-child(5) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(6),
 stream[type="camera"]:first-child:nth-last-child(6) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(7),
 stream[type="camera"]:first-child:nth-last-child(7) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(8),
 stream[type="camera"]:first-child:nth-last-child(8) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(9),
 stream[type="camera"]:first-child:nth-last-child(9) ~ stream[type="camera"] {
   width: 33.33%;
   height: 33.33%;
 }
 stream[type="camera"]:first-child:nth-last-child(10),
 stream[type="camera"]:first-child:nth-last-child(10) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(11),
 stream[type="camera"]:first-child:nth-last-child(11) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(12),
 stream[type="camera"]:first-child:nth-last-child(12) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(13),
 stream[type="camera"]:first-child:nth-last-child(13) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(14),
 stream[type="camera"]:first-child:nth-last-child(14) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(15),
 stream[type="camera"]:first-child:nth-last-child(15) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(16),
 stream[type="camera"]:first-child:nth-last-child(16) ~ stream[type="camera"] {
   width: 25%;
   height: 25%;
 }
 stream[type="camera"]:first-child:nth-last-child(17),
 stream[type="camera"]:first-child:nth-last-child(17) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(18),
 stream[type="camera"]:first-child:nth-last-child(18) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(19),
 stream[type="camera"]:first-child:nth-last-child(19) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(20),
 stream[type="camera"]:first-child:nth-last-child(20) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(21),
 stream[type="camera"]:first-child:nth-last-child(21) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(22),
 stream[type="camera"]:first-child:nth-last-child(22) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(23),
 stream[type="camera"]:first-child:nth-last-child(23) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(24),
 stream[type="camera"]:first-child:nth-last-child(24) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(25),
 stream[type="camera"]:first-child:nth-last-child(25) ~ stream[type="camera"] {
   width: 25%;
   height: 25%;
 }
 stream[type="camera"]:first-child:nth-last-child(26),
 stream[type="camera"]:first-child:nth-last-child(26) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(27),
 stream[type="camera"]:first-child:nth-last-child(27) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(28),
 stream[type="camera"]:first-child:nth-last-child(28) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(29),
 stream[type="camera"]:first-child:nth-last-child(29) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(30),
 stream[type="camera"]:first-child:nth-last-child(30) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(31),
 stream[type="camera"]:first-child:nth-last-child(31) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(32),
 stream[type="camera"]:first-child:nth-last-child(32) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(33),
 stream[type="camera"]:first-child:nth-last-child(33) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(34),
 stream[type="camera"]:first-child:nth-last-child(34) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(35),
 stream[type="camera"]:first-child:nth-last-child(35) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(36),
 stream[type="camera"]:first-child:nth-last-child(36) ~ stream[type="camera"] {
   width: 25%;
   height: 25%;
 }
 stream[type="camera"]:first-child:nth-last-child(37),
 stream[type="camera"]:first-child:nth-last-child(37) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(38),
 stream[type="camera"]:first-child:nth-last-child(38) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(39),
 stream[type="camera"]:first-child:nth-last-child(39) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(40),
 stream[type="camera"]:first-child:nth-last-child(40) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(41),
 stream[type="camera"]:first-child:nth-last-child(41) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(42),
 stream[type="camera"]:first-child:nth-last-child(42) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(43),
 stream[type="camera"]:first-child:nth-last-child(43) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(44),
 stream[type="camera"]:first-child:nth-last-child(44) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(45),
 stream[type="camera"]:first-child:nth-last-child(45) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(46),
 stream[type="camera"]:first-child:nth-last-child(46) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(47),
 stream[type="camera"]:first-child:nth-last-child(47) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(48),
 stream[type="camera"]:first-child:nth-last-child(48) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(49),
 stream[type="camera"]:first-child:nth-last-child(49) ~ stream[type="camera"] {
   width: 25%;
   height: 25%;
 }
 stream[type="camera"]:first-child:nth-last-child(50),
 stream[type="camera"]:first-child:nth-last-child(50) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(51),
 stream[type="camera"]:first-child:nth-last-child(51) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(52),
 stream[type="camera"]:first-child:nth-last-child(52) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(53),
 stream[type="camera"]:first-child:nth-last-child(53) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(54),
 stream[type="camera"]:first-child:nth-last-child(54) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(55),
 stream[type="camera"]:first-child:nth-last-child(55) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(56),
 stream[type="camera"]:first-child:nth-last-child(56) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(57),
 stream[type="camera"]:first-child:nth-last-child(57) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(58),
 stream[type="camera"]:first-child:nth-last-child(58) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(59),
 stream[type="camera"]:first-child:nth-last-child(59) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(60),
 stream[type="camera"]:first-child:nth-last-child(60) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(61),
 stream[type="camera"]:first-child:nth-last-child(61) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(62),
 stream[type="camera"]:first-child:nth-last-child(62) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(63),
 stream[type="camera"]:first-child:nth-last-child(63) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(64),
 stream[type="camera"]:first-child:nth-last-child(64) ~ stream[type="camera"] {
   width: 25%;
   height: 25%;
 }
 stream[type="camera"]:first-child:nth-last-child(65),
 stream[type="camera"]:first-child:nth-last-child(65) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(66),
 stream[type="camera"]:first-child:nth-last-child(66) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(67),
 stream[type="camera"]:first-child:nth-last-child(67) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(68),
 stream[type="camera"]:first-child:nth-last-child(68) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(69),
 stream[type="camera"]:first-child:nth-last-child(69) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(70),
 stream[type="camera"]:first-child:nth-last-child(70) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(71),
 stream[type="camera"]:first-child:nth-last-child(71) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(72),
 stream[type="camera"]:first-child:nth-last-child(72) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(73),
 stream[type="camera"]:first-child:nth-last-child(73) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(74),
 stream[type="camera"]:first-child:nth-last-child(74) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(75),
 stream[type="camera"]:first-child:nth-last-child(75) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(76),
 stream[type="camera"]:first-child:nth-last-child(76) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(77),
 stream[type="camera"]:first-child:nth-last-child(77) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(78),
 stream[type="camera"]:first-child:nth-last-child(78) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(79),
 stream[type="camera"]:first-child:nth-last-child(79) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(80),
 stream[type="camera"]:first-child:nth-last-child(80) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(81),
 stream[type="camera"]:first-child:nth-last-child(81) ~ stream[type="camera"] {
   width: 25%;
   height: 25%;
 }
 stream[type="camera"]:first-child:nth-last-child(82),
 stream[type="camera"]:first-child:nth-last-child(82) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(83),
 stream[type="camera"]:first-child:nth-last-child(83) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(84),
 stream[type="camera"]:first-child:nth-last-child(84) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(85),
 stream[type="camera"]:first-child:nth-last-child(85) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(86),
 stream[type="camera"]:first-child:nth-last-child(86) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(87),
 stream[type="camera"]:first-child:nth-last-child(87) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(88),
 stream[type="camera"]:first-child:nth-last-child(88) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(89),
 stream[type="camera"]:first-child:nth-last-child(89) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(90),
 stream[type="camera"]:first-child:nth-last-child(90) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(91),
 stream[type="camera"]:first-child:nth-last-child(91) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(92),
 stream[type="camera"]:first-child:nth-last-child(92) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(93),
 stream[type="camera"]:first-child:nth-last-child(93) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(94),
 stream[type="camera"]:first-child:nth-last-child(94) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(95),
 stream[type="camera"]:first-child:nth-last-child(95) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(96),
 stream[type="camera"]:first-child:nth-last-child(96) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(97),
 stream[type="camera"]:first-child:nth-last-child(97) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(98),
 stream[type="camera"]:first-child:nth-last-child(98) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(99),
 stream[type="camera"]:first-child:nth-last-child(99) ~ stream[type="camera"],
 stream[type="camera"]:first-child:nth-last-child(100),
 stream[type="camera"]:first-child:nth-last-child(100) ~ stream[type="camera"] {
   width: 25%;
   height: 25%;
 }`;