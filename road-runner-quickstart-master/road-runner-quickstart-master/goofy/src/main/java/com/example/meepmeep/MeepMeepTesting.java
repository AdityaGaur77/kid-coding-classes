package com.example.meepmeep;

import com.acmerobotics.roadrunner.Pose2d;
import com.acmerobotics.roadrunner.Vector2d;
import com.noahbres.meepmeep.MeepMeep;
import com.noahbres.meepmeep.roadrunner.DefaultBotBuilder;
import com.noahbres.meepmeep.roadrunner.entity.RoadRunnerBotEntity;

public class MeepMeepTesting {
    public static void main(String[] args) {
        MeepMeep meepMeep = new MeepMeep(800);

        RoadRunnerBotEntity myBot = new DefaultBotBuilder(meepMeep)
                // Set bot constraints: maxVel, maxAccel, maxAngVel, maxAngAccel, track width
                .setConstraints(500, 500, Math.toRadians(500), Math.toRadians(500), 9.4)
                .build();

        myBot.runAction(myBot.getDrive().actionBuilder(new Pose2d(0, -70, 0))
                .strafeTo(new Vector2d(0, -34))
                .strafeTo(new Vector2d(0, -30))
                .strafeTo(new Vector2d(0, -34))
                .strafeTo(new Vector2d(35, -34))
                .strafeTo(new Vector2d(35, -10))
                .strafeTo(new Vector2d(42, -10))
                .strafeTo(new Vector2d(42, -50))
                .strafeTo(new Vector2d(42, -10))
                .strafeTo(new Vector2d(52, -10))
                .strafeTo(new Vector2d(52, -50))
                .strafeTo(new Vector2d(52, -10))
                .strafeTo(new Vector2d(62, -10))
                .strafeTo(new Vector2d(62, -50))
                .strafeTo(new Vector2d(46, -50))
                .turnTo(-190)
                .turnTo(-570.2)
                .strafeTo(new Vector2d(0, -30))
                .strafeTo(new Vector2d(0, -34))

                .build());

        meepMeep.setBackground(MeepMeep.Background.FIELD_INTO_THE_DEEP_JUICE_DARK)
                .setDarkMode(true)
                .setBackgroundAlpha(0.95f)
                .addEntity(myBot)
                .start();
    }
}