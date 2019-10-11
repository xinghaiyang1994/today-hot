# today-hot

## 表结构
* channel
  ```sql
  CREATE TABLE `channel` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(20) NOT NULL DEFAULT '' COMMENT '渠道名称',
    `domain` varchar(100) NOT NULL DEFAULT '' COMMENT '渠道主域',
    `is_open` tinyint(4) NOT NULL DEFAULT '1' COMMENT '是否开启,未开启的将不会爬取, 0 为未开启, 1 为开启',
    `is_spa` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否为单页应用,0 不是 1 是',
    `cookie` varchar(1000) NOT NULL DEFAULT '' COMMENT 'cookie,''''代表不需要',
    `is_use_user_agent` tinyint(4) NOT NULL DEFAULT '0' COMMENT '是否使用随机userAgent.0 不适用 1 使用',
    `charset` varchar(20) NOT NULL COMMENT '字符编码,''''代表utf-8',
    `hot_url` varchar(100) NOT NULL DEFAULT '' COMMENT '热点页url',
    `list_special_method` varchar(20) NOT NULL DEFAULT '' COMMENT '特殊方法获取列表,''''代表按常规标签获取',
    `list_dom` varchar(100) NOT NULL DEFAULT '' COMMENT '单个列表标签',
    `list_title_dom` varchar(100) NOT NULL DEFAULT '' COMMENT '单个列表标题标签',
    `list_url_dom` varchar(100) NOT NULL DEFAULT '' COMMENT '单个列表url标签',
    `list_url_rule` varchar(100) NOT NULL DEFAULT '' COMMENT '单个列表url的规则',
    `sort` int(11) NOT NULL DEFAULT '1' COMMENT '排序权重.最大越靠前',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COMMENT='渠道';
  ```
* list
  ```sql
  CREATE TABLE `list` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `title` varchar(200) NOT NULL DEFAULT '' COMMENT '新闻标题',
    `url` varchar(500) NOT NULL COMMENT '新闻链接',
    `channel_id` int(11) NOT NULL COMMENT '所属渠道',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `sort` int(11) NOT NULL COMMENT '排序，越小越靠前',
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB AUTO_INCREMENT=527 DEFAULT CHARSET=utf8mb4 COMMENT='链接列表';
  ```
* channel_fail
  ```sql
  CREATE TABLE `channel_fail` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `channel_id` int(11) NOT NULL COMMENT '渠道id',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COMMENT='渠道抓取失败列表';
  ```
* suggest
  ```sql
  CREATE TABLE `suggest` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `contact` varchar(100) NOT NULL DEFAULT '' COMMENT '联系方式',
    `content` varchar(500) NOT NULL DEFAULT '' COMMENT '内容',
    `gmt_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `gmt_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COMMENT='建议列表';
  ```