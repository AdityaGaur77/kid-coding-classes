package com.example.meepmeeptest;

import static java.lang.Boolean.FALSE;

import com.acmerobotics.roadrunner.Pose2d;
import com.acmerobotics.roadrunner.Vector2d;
import com.noahbres.meepmeep.MeepMeep;
import com.noahbres.meepmeep.core.colorscheme.scheme.ColorSchemeBlueDark;
import com.noahbres.meepmeep.core.colorscheme.scheme.ColorSchemeRedLight;
import com.noahbres.meepmeep.roadrunner.Constraints;
import com.noahbres.meepmeep.roadrunner.DriveTrainType;
import com.noahbres.meepmeep.roadrunner.entity.RoadRunnerBotEntity;

public class twomeep {
    public static void main(String[] args) {
        MeepMeep meepMeep = new MeepMeep(800);

        // Declare our first bot
        RoadRunnerBotEntity myFirstBot = new RoadRunnerBotEntity(meepMeep, new Constraints(50, 50, 50, 50, 9.73818898), 12.47,12.88, new Pose2d(0, 0, Math.toRadians(90)), new ColorSchemeBlueDark(), 1, DriveTrainType.MECANUM,FALSE);

        myFirstBot.runAction(myFirstBot.getDrive().actionBuilder(new Pose2d(6.5, -70, Math.toRadians(90)))
                .splineTo(new Vector2d(6.5,-31),Math.toRadians(90))
                    .splineToConstantHeading(new Vector2d(6.5,-41),Math.toRadians(90))
                    .splineToLinearHeading(new Pose2d(34,-34,Math.toRadians(90)),0)
                    .splineToConstantHeading(new Vector2d(38,-15),Math.toRadians(90))
                    .splineToConstantHeading(new Vector2d(50,-15),Math.toRadians(90))
                    .splineToConstantHeading(new Vector2d(50,-50),Math.toRadians(90))
                    .splineToConstantHeading(new Vector2d(50,-15),Math.toRadians(90))
                    .splineToConstantHeading(new Vector2d(60,-15),Math.toRadians(90))
                    .splineToConstantHeading(new Vector2d(60,-50),Math.toRadians(90))
                    .splineToConstantHeading(new Vector2d(60,-15),Math.toRadians(90))
                    .splineToConstantHeading(new Vector2d(64,-15),Math.toRadians(90))
                    .splineToConstantHeading(new Vector2d(64,-55),Math.toRadians(90))
                    .splineToConstantHeading(new Vector2d(48,-52),Math.toRadians(90))
                    .turn(Math.toRadians(180))
                    .turn(Math.toRadians(-180))
                    .splineToConstantHeading(new Vector2d(6.5,-32),Math.toRadians(90))
                    .strafeTo(new Vector2d(48,-52))
                    .turn(Math.toRadians(180))
                    .turn(Math.toRadians(-180))
                    .splineToConstantHeading(new Vector2d(6.5,-32),Math.toRadians(90))
                    .strafeTo(new Vector2d(48,-52))
                    .turn(Math.toRadians(180))
                    .turn(Math.toRadians(-180))
                    .splineToConstantHeading(new Vector2d(6.5,-32),Math.toRadians(90))
                    .strafeTo(new Vector2d(48,-52))
                    .turn(Math.toRadians(180))
                    .turn(Math.toRadians(-180))
                    .splineToConstantHeading(new Vector2d(6.5,-32),Math.toRadians(90))
                    .strafeTo(new Vector2d(48,-60))
                .build());

        // Declare out second bot
        RoadRunnerBotEntity mySecondBot = new RoadRunnerBotEntity(meepMeep, new Constraints(50, 50, 50, 50, 9.73818898), 12.47,12.88, new Pose2d(0, 0, Math.toRadians(90)), new ColorSchemeRedLight(), 1, DriveTrainType.MECANUM,FALSE);


        mySecondBot.runAction(mySecondBot.getDrive().actionBuilder(new Pose2d(-6.5, -70, Math.toRadians(90)))
                .strafeTo(new Vector2d(-6.5,-31))
                .strafeTo(new Vector2d(-6.5, -34))
                .strafeTo(new Vector2d(-47.9, -41.2))
                .strafeTo(new Vector2d(-47.3, -29.2))
                .strafeTo(new Vector2d(-51.2, -58.2))
                .turn(Math.toRadians(-230))
                .turn(Math.toRadians(230))
                .strafeTo(new Vector2d(-57.1, -29.3))
                .strafeTo(new Vector2d(-51.2, -58.2))
                .turn(Math.toRadians(-230))
                .turn(Math.toRadians(230))
                .strafeTo(new Vector2d(-59.1, -29.3))
                .turn(Math.toRadians(80))
                .turn(Math.toRadians(-80))
                .strafeTo(new Vector2d(-51.2, -58.2))
                .turn(Math.toRadians(-230))
                .turn(Math.toRadians(230))
                .strafeTo(new Vector2d(-27.1, 1.1))
                .turn(Math.toRadians(90))
                .build());

        meepMeep.setBackground(MeepMeep.Background.FIELD_INTO_THE_DEEP_JUICE_DARK)
                .setDarkMode(true)
                .setBackgroundAlpha(0.95f)
                // Add both of our declared bot entities
                .addEntity(myFirstBot)
                .addEntity(mySecondBot)
                .start();
    }
}